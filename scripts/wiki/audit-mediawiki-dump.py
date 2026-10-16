#!/usr/bin/env python3
"""Stream a .7z MediaWiki export; count pages/revisions without loading the dump.
Requires py7zr in the operator's Python environment. Writes metadata only.
Usage: python audit-mediawiki-dump.py dump.7z --output /tmp/audit.json
"""
import argparse
import collections
import json
import xml.etree.ElementTree as ET
from pathlib import Path
import py7zr
from py7zr.io import Py7zIO, WriterFactory

class AuditWriter(Py7zIO):
    def __init__(self):
        self.parser = ET.XMLPullParser(events=('start', 'end'))
        self.root = None
        self.bytes = self.pages = self.revisions = self.redirects = 0
        self.namespaces = collections.Counter()
        self.site = {}
        self.example_titles = []
    def write(self, chunk):
        self.bytes += len(chunk)
        self.parser.feed(chunk)
        for event, element in self.parser.read_events():
            name = element.tag.rsplit('}', 1)[-1]
            if self.root is None and event == 'start': self.root = element
            if event != 'end': continue
            if name == 'siteinfo':
                self.site = {e.tag.rsplit('}', 1)[-1]: e.text for e in element if e.tag.rsplit('}', 1)[-1] in ('sitename', 'dbname', 'base', 'generator')}
            elif name == 'revision':
                self.revisions += 1
                element.clear()
            elif name == 'page':
                self.pages += 1
                fields = {e.tag.rsplit('}', 1)[-1]: e for e in element}
                self.namespaces[fields['ns'].text] += 1
                self.redirects += int('redirect' in fields)
                if len(self.example_titles) < 8: self.example_titles.append(fields['title'].text)
                element.clear()
                self.root.clear()
        return len(chunk)
    def read(self, size=None): raise OSError('write-only stream')
    def seek(self, offset, whence=0):
        # py7zr rewinds custom writers at close; the audit retains metadata only.
        if offset == 0 and whence == 0: return 0
        raise OSError('sequential stream')
    def flush(self): pass
    def size(self): return self.bytes

class AuditFactory(WriterFactory):
    def __init__(self): self.writers = {}
    def create(self, filename):
        writer = AuditWriter()
        self.writers[filename] = writer
        return writer

def main():
    args = argparse.ArgumentParser()
    args.add_argument('archive', type=Path)
    args.add_argument('--output', type=Path, required=True)
    opts = args.parse_args()
    factory = AuditFactory()
    with py7zr.SevenZipFile(opts.archive) as archive:
        archive.extractall(factory=factory)
    result = {'archive': opts.archive.name, 'members': {name: {'site': w.site, 'xml_bytes': w.bytes, 'pages': w.pages, 'revisions': w.revisions, 'redirects': w.redirects, 'namespace_counts': dict(w.namespaces), 'example_titles': w.example_titles} for name, w in factory.writers.items()}}
    opts.output.write_text(json.dumps(result, indent=2)+'\n')
    print(json.dumps(result))
if __name__ == '__main__': main()
