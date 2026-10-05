/**
 * Panel Profits ComicBase 4K Cover Bridge
 * 
 * Synchronizes high-resolution ComicBase covers to Supabase Storage ('comic-covers' bucket)
 * and updates the authoritative catalog records in PostgreSQL.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let dbUrl = process.env.DATABASE_URL;

if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = trimmed.split('=')[1].trim().replace(/^["']|["']$/g, '');
    } else if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseKey = trimmed.split('=')[1].trim().replace(/^["']|["']$/g, '');
    } else if (trimmed.startsWith('DATABASE_URL=')) {
      dbUrl = trimmed.split('=')[1].trim().replace(/^["']|["']$/g, '');
    }
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function normalizeSeries(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/,\s*the$/, '')
    .replace(/[\(\)\[\]:—\-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeIssue(str) {
  if (!str) return '';
  return str.toString().trim().replace(/^0+/, '');
}

async function uploadCoverToSupabase(filePath, comicId) {
  const fileBuffer = fs.readFileSync(filePath);
  const prefix = comicId.substring(0, 2);
  const storagePath = `pp/${prefix}/${comicId}.jpg`;

  const { data, error } = await supabase.storage
    .from('comic-covers')
    .upload(storagePath, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
      cacheControl: '31536000'
    });

  if (error) {
    throw new Error(`Upload failed for ${comicId}: ${error.message}`);
  }

  return storagePath;
}

module.exports = {
  normalizeSeries,
  normalizeIssue,
  uploadCoverToSupabase,
};

if (require.main === module) {
  console.log('--- Panel Profits ComicBase 4K Bridge Initialized ---');
  console.log('Supabase Target:', supabaseUrl);
  console.log('Bucket: comic-covers');
}
