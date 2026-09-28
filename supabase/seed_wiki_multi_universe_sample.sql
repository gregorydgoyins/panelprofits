-- Multi-Universe Wiki Lore & Character Seed (Sample Premier Dossiers)
-- Inserts canonical characters, items, weapons, locations, and teams into ppcf_wiki_pages

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('emil-blonsky-earth-616', 'Abomination', 'CHARACTER', 'Human Gamma Mutate', 'READY', 'MARVEL', 'Earth-616', 'Stan Lee; Gil Kane', 'Tales to Astonish Vol 1 90')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('corey-flynn-earth-616', 'Absalom', 'CHARACTER', 'Marvel Universe character: Absalom', 'READY', 'MARVEL', 'Earth-616', 'Fabian Nicieza; Rob Liefeld; Mark Pacella', 'X-Force Vol 1 10')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('carl-creel-earth-616', 'Absorbing Man', 'CHARACTER', 'Human enhanced by Loki; later transformed using gamma energy but was eventually depowered', 'READY', 'MARVEL', 'Earth-616', 'Stan Lee; Bill Everett; Jack Kirby', 'Daredevil Vol 1 1')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('adam-warlock-earth-616', '| Title = Warlock', 'CHARACTER', 'Marvel Universe character: | Title = Warlock', 'READY', 'MARVEL', 'Earth-616', 'Stan Lee; Jack Kirby', 'Fantastic Four Vol 1 66')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('adam-neramani-earth-616', 'Adam-X', 'CHARACTER', 'Shi''ar/Mutant hybrid', 'READY', 'MARVEL', 'Earth-616', 'Fabian Nicieza; Tony Daniel', 'X-Force Annual Vol 1 2')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('eric-cameron-earth-616', 'Adonis', 'CHARACTER', '| Reality = Earth-616', 'READY', 'MARVEL', 'Earth-616', 'Roger McKenzie; Rich Buckler', 'Captain America Vol 1 243')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('adri-nital-earth-616', '| Aliases =', 'CHARACTER', 'Marvel Universe character: | Aliases =', 'READY', 'MARVEL', 'Earth-616', 'Marv Wolfman; Gene Colan', 'Tomb of Dracula Vol 1 28')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('adversary-earth-616', '* The Great TricksterOfficial Handbook of the Marvel Universe Update ''89 Vol 1 1 * Sefako the Twice-Risen GodBlack Panther Vol 6 171', 'CHARACTER', 'Demonic GodMarvel Encyclopedia Vol 1 1|; 2009 edition', 'READY', 'MARVEL', 'Earth-616', 'Chris Claremont; John Romita, Jr.', 'Uncanny X-Men Vol 1 188')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('aeroika-earth-616', 'Aeroika', 'CHARACTER', 'Winged One', 'READY', 'MARVEL', 'Earth-616', 'Ed Hannigan; Herb Trimpe', 'Defenders Vol 1 78')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('agatha-harkness-earth-616', '| Titles = * True Sorcerer SupremeSorcerer Supreme Vol 1 2', 'CHARACTER', 'Marvel Universe character: | Titles = * True Sorcerer SupremeSorcerer Supreme Vol 1 2', 'READY', 'MARVEL', 'Earth-616', 'Stan Lee; Jack Kirby', 'Fantastic Four Vol 1 94')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('agent-axis-earth-616', 'Agent Axis', 'CHARACTER', 'Marvel Universe character: Agent Axis', 'READY', 'MARVEL', 'Earth-616', 'Stan Lee; Jack Kirby; Roy Thomas; Frank Robbins', 'Tales of Suspense Vol 1 82')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('cynthia-glass-earth-616', 'Agent X', 'CHARACTER', 'Marvel Universe character: Agent X', 'READY', 'MARVEL', 'Earth-616', 'Fabian Nicieza; Kevin Maguire', 'Adventures of Captain America Vol 1 1')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('christoph-nord-earth-616', 'Maverick', 'CHARACTER', 'Mutant (''''see notes''''); formerly VampireWolverine: Blood Hunt Vol 1 4', 'READY', 'MARVEL', 'Earth-616', 'Larry Hama; Marc Silvestri', 'Wolverine Vol 2 48')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('aginar-earth-616', '| Aliases =', 'CHARACTER', 'Eternal', 'READY', 'MARVEL', 'Earth-616', 'Jack Kirby', 'Eternals Vol 1 11')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('agon-earth-616', 'King Agon', 'CHARACTER', 'Marvel Universe character: King Agon', 'READY', 'MARVEL', 'Earth-616', 'Stan Lee; Jack Kirby', 'Thor Vol 1 148')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('agron-earth-76216', '| Aliases = Agron the Unliving', 'CHARACTER', 'Marvel Universe character: | Aliases = Agron the Unliving', 'READY', 'MARVEL', 'Earth-76216', 'Jack Kirby', 'Captain America Vol 1 204')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('alejandro-montoya-earth-616', 'El Águila', 'CHARACTER', 'MutantNew Avengers Vol 1 18Power Man and Iron Fist Vol 2 2', 'READY', 'MARVEL', 'Earth-616', 'Jo Duffy; Trevor von Eedon; Dave Cockrum', 'Power Man and Iron Fist Vol 1 58')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('gabriel-lan-earth-616', 'Air-Walker', 'CHARACTER', 'Xandarian transformed into Air-Walker by Galactus', 'READY', 'MARVEL', 'Earth-616', 'Mark Gruenwald; Ralph Macchio; Keith Pollard', 'Thor Vol 1 306')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('air-walker-automaton-earth-616', '| Aliases = Gabriel', 'CHARACTER', 'Marvel Universe character: | Aliases = Gabriel', 'READY', 'MARVEL', 'Earth-616', '', 'Fantastic Four Vol 1 120')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('ajak-earth-616', 'Ajak Celestia', 'CHARACTER', 'Marvel Universe character: Ajak Celestia', 'READY', 'MARVEL', 'Earth-616', 'Jack Kirby', 'Eternals Vol 1 2')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('thomas-jones-earth-616', 'Alchemy', 'CHARACTER', 'Marvel Universe character: Alchemy', 'READY', 'MARVEL', 'Earth-616', 'Paul Bestow', 'X-Factor Vol 1 41')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('allatou-earth-616', '| Aliases =', 'CHARACTER', 'Demon', 'READY', 'MARVEL', 'Earth-616', 'Steve Gerber; Gene Colan', 'Marvel Spotlight Vol 1 18')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('alpha-mutant-earth-616', 'Alpha the Ultimate Mutant', 'CHARACTER', 'Artificial Mutant, bioengineered by Magneto', 'READY', 'MARVEL', 'Earth-616', 'Len Wein; Sal Buscema; Klaus Janson', 'Defenders Vol 1 15')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('marlene-alraune-earth-616', '| Aliases = * Marlene FontaineMarvel Spotlight Vol 1 28 * Mary SandsMoon Knight Vol 1 19', 'CHARACTER', 'Marvel Universe character: | Aliases = * Marlene FontaineMarvel Spotlight Vol 1 28 * Mary SandsMoon Knight Vol 1 19', 'READY', 'MARVEL', 'Earth-616', 'Doug Moench; Don Perlin', 'Marvel Spotlight Vol 1 28')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('amaa-earth-616', '| Aliases =', 'CHARACTER', 'Marvel Universe character: | Aliases =', 'READY', 'MARVEL', 'Earth-616', 'Mark Gruenwald; Ron Wilson', 'Official Handbook of the Marvel Universe Vol 1 1')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('ambur-earth-616', '| Aliases = Queen AmburIVX Vol 1 1', 'CHARACTER', 'Marvel Universe character: | Aliases = Queen AmburIVX Vol 1 1', 'READY', 'MARVEL', 'Earth-616', 'G. Willow Wilson; Peter Nguyen', 'Women of Marvel: Marvel Digital Comics Exclusive Vol 1 1')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('jason-strongbow-earth-616', 'American Eagle', 'CHARACTER', 'Marvel Universe character: American Eagle', 'READY', 'MARVEL', 'Earth-616', 'Doug Moench; Ron Wilson', 'Marvel Two-In-One Annual Vol 1 6')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('lyle-dekker-earth-616', 'Ameridroid', 'CHARACTER', 'Marvel Universe character: Ameridroid', 'READY', 'MARVEL', 'Earth-616', 'Sal Buscema; Mike Esposito; Don Glut; John Tartag', 'Captain America Vol 1 218')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('ammo-earth-616', '| Affiliation = Munition Militia Formerly: leader of the Wildboys', 'CHARACTER', '| Reality = 616', 'READY', 'MARVEL', 'Earth-616', 'Ann Nocenti; John Romita Jr.', 'Daredevil Vol 1 252')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('kingsley-rice-earth-712', 'Amphibian', 'CHARACTER', 'Mutant', 'READY', 'MARVEL', 'Earth-712', 'Steve Englehart; George Perez', 'Avengers Vol 1 148')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('amphibius-earth-616', '| Affiliation = Savage Land Mutates Formerly: Swamp Men', 'CHARACTER', 'Mutate from the Savage Land', 'READY', 'MARVEL', 'Earth-616', 'Roy Thomas; Neal Adams', 'X-Men Vol 1 62')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('blanche-sitznski-earth-616', 'Anaconda', 'CHARACTER', 'Human Mutate (Bioengineered to have various permanent serpentine adaptations)Category:Genetically Engineered', 'READY', 'MARVEL', 'Earth-616', 'Mark Gruenwald; Ralph Macchio; George Perez', 'Marvel Two-In-One Vol 1 64')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('tike-alicar-earth-616', 'Anarchist', 'CHARACTER', 'Marvel Universe character: Anarchist', 'READY', 'MARVEL', 'Earth-616', 'Peter Milligan; Michael Allred', 'X-Force Vol 1 116')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('yao-earth-616', 'Ancient One', 'CHARACTER', 'Marvel Universe character: Ancient One', 'READY', 'MARVEL', 'Earth-616', 'Larry Lieber; Jack Kirby; Stan Lee; Steve Ditko', 'Amazing Adventures Vol 1 1')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('andromeda-attumasen-earth-616', '| Aliases = * Andrea McPheeNew Defenders Vol 1 145 * Genevieve CrossDoctor Strange, Sorcerer Supreme Vol 1 3|4 * Andromeda the SwordFantastic Four Vol 3 578', 'CHARACTER', 'Atlantean', 'READY', 'MARVEL', 'Earth-616', 'Peter B. Gillis; Don Perlin', 'New Defenders Vol 1 143')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('david-angar-earth-616', 'Angar the Screamer', 'CHARACTER', 'Marvel Universe character: Angar the Screamer', 'READY', 'MARVEL', 'Earth-616', 'Steve Gerber; Gene Colan', 'Daredevil Vol 1 100')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('thomas-halloway-earth-616', 'Angel', 'CHARACTER', 'Marvel Universe character: Angel', 'READY', 'MARVEL', 'Earth-616', 'Paul Gustavson;', 'Marvel Comics Vol 1 1')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('simon-halloway-earth-616', 'Angel', 'CHARACTER', 'Marvel Universe character: Angel', 'READY', 'MARVEL', 'Earth-616', 'Peter David; Gary Hartle', 'Marvel Super-Heroes Vol 2 7')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('warren-worthington-iii-earth-616', 'Archangel', 'CHARACTER', 'Mutant (purportedly Cheyarafim throwback);Marvel Zombies: The Book of Angels, Demons & Various Monstrosities Vol 1 1|; Angels'' entry later granted Techno-Organic wings by Apocalypse on his Celestial Ship, then reborn from the Celestial Seed', 'READY', 'MARVEL', 'Earth-616', 'Stan Lee; Jack Kirby', 'X-Men Vol 1 1')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('angel-salvadore-earth-616', 'Tempest', 'CHARACTER', 'Mutant', 'READY', 'MARVEL', 'Earth-616', 'Grant Morrison; Ethan Van Sciver', 'New X-Men Vol 1 118')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('barry-allen-new-earth', 'The Flash', 'CHARACTER', 'DC Universe character: The Flash', 'READY', 'DC', 'Earth-One; New Earth', 'Robert Kanigher; John Broome; Carmine Infantino', 'Showcase Vol 1 4')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('jason-garrick-new-earth', 'The Flash', 'CHARACTER', 'DC Universe character: The Flash', 'READY', 'DC', 'Earth-Two; New Earth', 'Gardner Fox; Harry Lampert', 'Flash Comics Vol 1 1')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('eobard-thawne-new-earth', 'Professor Zoom', 'CHARACTER', 'DC Universe character: Professor Zoom', 'READY', 'DC', 'Earth-One; New Earth', '', 'The Flash Vol 1 139')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('bruce-wayne-new-earth', 'Batman', 'CHARACTER', 'DC Universe character: Batman', 'READY', 'DC', 'New Earth', 'Bill Finger; Bob Kane', 'Batman Vol 1 401')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('bart-allen-new-earth', 'Kid Flash', 'CHARACTER', 'DC Universe character: Kid Flash', 'READY', 'DC', 'New Earth', 'Mark Waid; Mike Wieringo', 'The Flash Vol 2 92')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('max-mercury-new-earth', 'Max Mercury', 'CHARACTER', 'DC Universe character: Max Mercury', 'READY', 'DC', 'New Earth', '', 'Young All-Stars Vol 1 2')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('jason-todd-new-earth', 'Red Hood', 'CHARACTER', 'DC Universe character: Red Hood', 'READY', 'DC', 'New Earth', '', 'Batman Vol 1 401')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('donna-troy-new-earth', 'Donna Troy', 'CHARACTER', 'DC Universe character: Donna Troy', 'READY', 'DC', 'Earth-One; New Earth', 'Bob Haney; Bruno Premiani', 'The Brave and the Bold #60')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('lana-lang-new-earth', 'Lana Lang', 'CHARACTER', 'DC Universe character: Lana Lang', 'READY', 'DC', 'New Earth', 'Bill Finger; John Sikela', 'The Man of Steel #1')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('timothy-drake-new-earth', 'Red Robin', 'CHARACTER', 'DC Universe character: Red Robin', 'READY', 'DC', 'New Earth', 'Marv Wolfman; Pat Broderick', 'Batman Vol 1 436')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('stephanie-brown-new-earth', 'Batgirl', 'CHARACTER', 'DC Universe character: Batgirl', 'READY', 'DC', 'New Earth', 'Chuck Dixon; Tom Lyle', 'Detective Comics #647')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('arthur-brown-new-earth', 'Cluemaster', 'CHARACTER', 'DC Universe character: Cluemaster', 'READY', 'DC', 'Earth-One; New Earth', 'Gardner Fox; Carmine Infantino', 'Detective Comics Vol 1 351')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('joker-new-earth', 'The Joker', 'CHARACTER', 'DC Universe character: The Joker', 'READY', 'DC', 'New Earth', 'Jerry Robinson; Bill Finger; Bob Kane', 'Batman Vol 1 1')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('alfred-pennyworth-new-earth', 'Alfred Pennyworth', 'CHARACTER', 'DC Universe character: Alfred Pennyworth', 'READY', 'DC', 'New Earth', 'Don C. Cameron; Bob Kane', 'Batman Vol 1 16')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('hal-jordan-new-earth', 'Green Lantern', 'CHARACTER', 'DC Universe character: Green Lantern', 'READY', 'DC', 'Earth-One; New Earth', 'John Broome; Gil Kane', 'Showcase Vol 1 22')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('alan-scott-new-earth', 'Green Lantern', 'CHARACTER', 'DC Universe character: Green Lantern', 'READY', 'DC', 'Earth-Two; New Earth', 'Bill Finger; Martin Nodell', 'All-American Comics Vol 1 16')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('edward-nashton-new-earth', 'The Riddler', 'CHARACTER', 'DC Universe character: The Riddler', 'READY', 'DC', 'New Earth', 'Bill Finger; Dick Sprang; Chuck Dixon', 'Batman Vol 1 415')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('oswald-cobblepot-new-earth', 'The Penguin', 'CHARACTER', 'DC Universe character: The Penguin', 'READY', 'DC', 'New Earth', 'Bill Finger; Bob Kane', 'Detective Comics Vol 1 568')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('bane-new-earth', 'Bane', 'CHARACTER', 'DC Universe character: Bane', 'READY', 'DC', 'New Earth', 'Dennis O''Neil; Chuck Dixon; Graham Nolan', 'Batman: Vengeance of Bane Vol 1 1')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('pamela-isley-new-earth', 'Poison Ivy', 'CHARACTER', 'DC Universe character: Poison Ivy', 'READY', 'DC', 'Earth-One; New Earth', 'Robert Kanigher; Sheldon Moldoff', 'Batman #181')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('silver-st-cloud-new-earth', '| Aliases =', 'CHARACTER', 'DC Universe character: | Aliases =', 'READY', 'DC', 'Earth-One; New Earth', 'Steve Englehart; Walt Simonson', 'Detective Comics Vol 1 470')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('ras-al-ghul-new-earth', 'Ra''s al Ghul', 'CHARACTER', 'DC Universe character: Ra''s al Ghul', 'READY', 'DC', 'Earth-One; New Earth; Post-Zero Hour', 'Dennis O''Neil; Neal Adams; Julius Schwartz', 'Batman Vol 1 232')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('lucius-fox-new-earth', '| Aliases =', 'CHARACTER', 'DC Universe character: | Aliases =', 'READY', 'DC', 'Earth-One; New Earth', 'Len Wein; John Calnan', 'Batman Vol 1 307')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('jean-paul-valley-new-earth', 'Azrael', 'CHARACTER', 'DC Universe character: Azrael', 'READY', 'DC', 'New Earth', 'Dennis O''Neil; Joe Quesada', 'Batman: Sword of Azrael Vol 1 1')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('harleen-quinzel-new-earth', 'Harley Quinn', 'CHARACTER', 'DC Universe character: Harley Quinn', 'READY', 'DC', 'New Earth', 'Paul Dini; Bruce Timm', 'Batman: Harley Quinn')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('jervis-tetch-new-earth', 'Mad Hatter', 'CHARACTER', 'DC Universe character: Mad Hatter', 'READY', 'DC', 'Earth-Two; Earth-One; New Earth', 'Bill Finger; Lew Sayre Schwartz', 'Batman Vol 1 49')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('harvey-dent-new-earth', 'Two-Face', 'CHARACTER', 'DC Universe character: Two-Face', 'READY', 'DC', 'Earth-One; New Earth', 'Bill Finger; Bob Kane', 'Detective Comics Vol 1 66')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('basil-karlo-new-earth', 'Clayface', 'CHARACTER', 'DC Universe character: Clayface', 'READY', 'DC', 'New Earth', 'Bill Finger; Bob Kane', 'Detective Comics Vol 1 40')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('matthew-hagen-new-earth', 'Clayface', 'CHARACTER', 'DC Universe character: Clayface', 'READY', 'DC', 'Earth-One; New Earth', 'Bill Finger; Sheldon Moldoff', 'Detective Comics Vol 1 298')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('preston-payne-new-earth', 'Clayface', 'CHARACTER', 'DC Universe character: Clayface', 'READY', 'DC', 'Earth-One; New Earth', 'Len Wein; Marshall Rogers; Marv Wolfman; Neal Adams', 'Detective Comics Vol 1 477')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('cassius-payne-new-earth', 'Clayface', 'CHARACTER', 'DC Universe character: Clayface', 'READY', 'DC', 'New Earth', 'Alan Grant; Bret Blevins', 'Batman: Shadow of the Bat Vol 1 27')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('john-stewart-new-earth', 'Green Lantern', 'CHARACTER', 'DC Universe character: Green Lantern', 'READY', 'DC', 'Earth-One; New Earth', 'Dennis O''Neil; Neal Adams', 'Green Lantern Vol 2 #87')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('guy-gardner-new-earth', 'Green Lantern', 'CHARACTER', 'DC Universe character: Green Lantern', 'READY', 'DC', 'Earth-One; New Earth', 'John Broome; Gil Kane', 'Green Lantern Vol 2 59')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('alexander-luthor-new-earth', 'Lex Luthor', 'CHARACTER', 'DC Universe character: Lex Luthor', 'READY', 'DC', 'New Earth', 'Jerry Siegel; Joe Shuster', 'Swamp Thing Vol 2 52')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('theodore-kord-new-earth', 'Blue Beetle', 'CHARACTER', 'DC Universe character: Blue Beetle', 'READY', 'DC', 'New Earth', 'Steve Ditko; Gary Friedrich', 'Secret Origins Vol 2 2')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('jean-loring-new-earth', '| Aliases = Eclipso', 'CHARACTER', 'DC Universe character: | Aliases = Eclipso', 'READY', 'DC', 'Earth-One; New Earth', 'Gardner Fox; Gil Kane', 'Showcase #34')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('susan-dearbon-new-earth', 'Sue Dibny', 'CHARACTER', 'DC Universe character: Sue Dibny', 'READY', 'DC', 'Earth-One; New Earth', '', 'The Flash #119')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('ralph-dibny-new-earth', 'Elongated Man', 'CHARACTER', 'DC Universe character: Elongated Man', 'READY', 'DC', 'Earth-One; New Earth', 'John Broome; Carmine Infantino', 'The Flash Vol 1 112')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('jonn-jonzz-new-earth', 'Martian Manhunter', 'CHARACTER', 'DC Universe character: Martian Manhunter', 'READY', 'DC', 'New Earth', 'Joseph Samachson; Joe Certa', 'Justice League of America Vol 1 255')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('orin-new-earth', 'Aquaman', 'CHARACTER', 'DC Universe character: Aquaman', 'READY', 'DC', 'Earth-One; New Earth', 'Mort Weisinger; Paul Norris', 'Adventure Comics Vol 1 211')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('brianna', 'Brianna', 'CHARACTER', 'Homeworld: |birth=3976 BBY · Affiliation: Jedi', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('atris', 'Atris', 'CHARACTER', 'Homeworld: |birth= · Affiliation: *Jedi Order **Jedi High Council **Lost Jedi *Galactic Republic', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('meetra-surik', 'Meetra Surik"Jedi Exile"', 'CHARACTER', 'Species: Human · Homeworld: Dantooine · Affiliation: *Jedi Order exiled *Onderon Royalists', 'READY', 'STAR_WARS', 'Canon', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('ainlee-teemlegends', 'Ainlee Teem', 'CHARACTER', 'Species: Gran · Homeworld: Malastare · Affiliation: *Galactic Republic **Galactic Senate', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('palpatinelegends', 'PalpatineDarth Sidious', 'CHARACTER', 'Species: Human Naboo · Homeworld: Naboo · Affiliation: *Damask Holdings *Galactic Republic *Galactic Empire *Dark Empire **Dark Side Elite', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('aayla-securalegends', 'Aayla Secura', 'CHARACTER', 'Species: Twi''lek Rutian · Homeworld: Ryloth · Affiliation: *Jedi Order **Blue Squadron', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('firmus-piettlegends', 'Firmus Piett', 'CHARACTER', 'Species: Human · Homeworld: Axxila · Affiliation: *Axxila antipirate fleet *Galactic Empire **Imperial Navy ***Death Squadron', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('firmus-piett', 'Firmus Piett', 'CHARACTER', 'Species: Human · Homeworld: Axxila · Affiliation: Galactic Empire', 'READY', 'STAR_WARS', 'Canon', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('sevrance-tannlegends', 'Sev''rance Tann', 'CHARACTER', 'Species: Chiss · Homeworld: Csilla · Affiliation: *Chiss Ascendancy **Chiss Academy *Confederacy of Independent Systems **Confederacy military', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('jango-fettlegends', 'Jango Fett', 'CHARACTER', 'Species: Human · Homeworld: Concord Dawn · Affiliation: *Mandalorians **True Mandalorians *Galactic Republic *Confederacy of Independent Systems', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('blylegends', 'BlyCC-5052', 'CHARACTER', 'Species: Human clone · Homeworld: Kamino · Affiliation: *Galactic Republic *Galactic Empire', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('passel-argentelegends', 'Passel Argente', 'CHARACTER', 'Species: Koorivar · Homeworld: Kooriva · Affiliation: *Confederacy of Independent Systems **Separatist Council *Corporate Alliance **Lethe Merchandising *Galactic Republic **Galactic Senate', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('dookulegends', 'DookuDarth Tyranus', 'CHARACTER', 'Species: Human · Homeworld: Serenno · Affiliation: Sith', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('obi-wan-kenobilegends', 'Obi-Wan Kenobi', 'CHARACTER', 'Species: Human · Homeworld: Stewjon · Affiliation: Jedi', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('luke-skywalkerlegends', 'Luke Skywalker', 'CHARACTER', 'Species: Human · Homeworld: Tatooine · Affiliation: *Alliance to Restore the Republic **Endor strike team *Jedi Order *Bright Tree Village *Order of the Sith Lords briefly *Dark Empire briefly **Saber Squadron **Twin Suns Squadron **Blackmoon Squadron **StealthX wing *Jedi Coalition *Galactic Federation of Free Alliances', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('han-sololegends', 'Han Solo', 'CHARACTER', 'Homeworld: Corellia · Affiliation: *Imperial Marines *Galactic Empire *Hutt Cartel *Alliance of Free Planets *New Republic *Bright Tree Village *Independent Shippers Association *Galactic Federation of Free Alliances *Five Worlds, later Confederation *Jedi Coalition', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('padmé-amidalalegends', 'Padmé Amidala', 'CHARACTER', 'Species: Human Naboo · Homeworld: Naboo · Affiliation: *Refugee Relief Movement *Apprentice Legislature ***Delegation of 2000 *Galactic Empire **Imperial Senate', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('yodalegends', 'Yoda', 'CHARACTER', 'Species: Yoda''s species · Homeworld: |birth=896 BBY 861BrS · Affiliation: *Jedi Order *Galactic Republic', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('qui-gon-jinnlegends', 'Qui-Gon Jinn', 'CHARACTER', 'Species: Human · Homeworld: Unidentified planet · Affiliation: *Alaris Prime colonists *Jedi Order **Old Guard *Galactic Republic', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('nute-gunraylegends', 'Nute Gunray', 'CHARACTER', 'Species: Neimoidian · Homeworld: Neimoidia · Affiliation: *Nute hive *Neimoidian Inner Circle *Trade Federation *Order of the Sith Lords **Separatist Council', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('leia-organa-sololegends', 'Leia Organa Solo', 'CHARACTER', 'Species: Human · Homeworld: Alderaan · Affiliation: *Galactic Empire *Alliance to Restore the Republic *New Republic *Galactic Federation of Free Alliances *Five Worlds *Jedi Coalition', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('boba-fettlegends', 'Boba Fett', 'CHARACTER', 'Species: Human clone · Homeworld: Kamino · Affiliation: *Journeyman Protectors *Jabba Desilijic Tiure''s criminal empire *Bounty Hunters'' Guild as an infiltrator *Mandalorians **Mandalorian Protectors *Yuuzhan Vong Empire as a spy *Galactic Federation of Free Alliances **Jedi Coalition', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('grievouslegends', 'Grievous', 'CHARACTER', 'Species: Kaleesh · Homeworld: Kalee · Affiliation: *Kolkpravis *InterGalactic Banking Clan *Confederacy of Independent Systems **Separatist Droid Army', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('darth-maullegends', 'Darth Maul', 'CHARACTER', 'Species: Dathomirian Zabrak · Homeworld: Dathomir; also raised on Mustafar · Affiliation: Sith', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('bail-prestor-organalegends', 'Bail Prestor Organa', 'CHARACTER', 'Species: Human Alderaanian · Homeworld: Alderaan · Affiliation: *High Court of Alderaan *Galactic Republic ***Delegation of 2000 *Galactic Empire **Imperial Senate *Kota''s Militia *Alliance to Restore the Republic', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('chewbaccalegends', 'Chewbacca', 'CHARACTER', 'Species: Wookiee Rwook · Homeworld: Kashyyyk · Affiliation: *Alaris Prime colonists *Alliance to Restore the Republic *Galactic Republic *New Republic *Han Solo and his family life debt *Bright Tree Village', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('lando-calrissianlegends', 'Lando Calrissian', 'CHARACTER', 'Homeworld: Socorro · Affiliation: *Alliance to Restore the Republic **Raptor Squad **Gold Group *New Republic', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('wilhuff-tarkinlegends', 'Wilhuff Tarkin', 'CHARACTER', 'Species: Human · Homeworld: Eriadu · Affiliation: *Tarkin family *Galactic Republic ***Republic Outland Regions Security Force *Galactic Empire **Imperial Navy **Battle Station Command **Imperial Department of Military Research **Imperial High Command', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('finis-valorumlegends', 'Finis Valorum', 'CHARACTER', 'Homeworld: Coruscant · Affiliation: Galactic Republic', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('kalpana-supreme-chancellorlegends', 'Kalpana (Supreme Chancellor)', 'CHARACTER', 'Homeworld: |birth= · Affiliation: *Galactic Republic **Galactic Senate **Office of the Supreme Chancellor', 'READY', 'STAR_WARS', 'Legends', 'George Lucas', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('aj-ritter-image', 'A.J. Ritter', 'CHARACTER', 'Image universe character: A.J. Ritter', 'READY', 'IMAGE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('aaron-the-walking-dead-image', 'Aaron (The Walking Dead)', 'CHARACTER', 'Image universe character: Aaron (The Walking Dead)', 'READY', 'IMAGE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('aaron-weimar-revival-image', 'Aaron Weimar (Revival)', 'CHARACTER', 'Image universe character: Aaron Weimar (Revival)', 'READY', 'IMAGE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('aaron-wilkes-sons-of-the-devil-image', 'Aaron Wilkes (Sons of the Devil)', 'CHARACTER', 'Image universe character: Aaron Wilkes (Sons of the Devil)', 'READY', 'IMAGE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('ab-image', 'Ab', 'CHARACTER', 'Image universe character: Ab', 'READY', 'IMAGE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('ab-death-wildstorm-universe-image', 'Ab-Death (Wildstorm Universe)', 'CHARACTER', 'Image universe character: Ab-Death (Wildstorm Universe)', 'READY', 'IMAGE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('abaddon-image', 'Abaddon', 'CHARACTER', 'Image universe character: Abaddon', 'READY', 'IMAGE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('abbey-chase-image', 'Abbey Chase', 'CHARACTER', 'Image universe character: Abbey Chase', 'READY', 'IMAGE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('abdiel-image', 'Abdiel', 'CHARACTER', 'Image universe character: Abdiel', 'READY', 'IMAGE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('abel-spawn-image', 'Abel (Spawn)', 'CHARACTER', 'Image universe character: Abel (Spawn)', 'READY', 'IMAGE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('abigail-barker-nailbiter-image', 'Abigail Barker (Nailbiter)', 'CHARACTER', 'Image universe character: Abigail Barker (Nailbiter)', 'READY', 'IMAGE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('abigail-van-alstine-top-cow-image', 'Abigail van Alstine (Top Cow)', 'CHARACTER', 'Image universe character: Abigail van Alstine (Top Cow)', 'READY', 'IMAGE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('abraham-ford-the-walking-dead-image', 'Abraham Ford (The Walking Dead)', 'CHARACTER', 'Image universe character: Abraham Ford (The Walking Dead)', 'READY', 'IMAGE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('adam-booth-extreme-image', 'Adam Booth (Extreme)', 'CHARACTER', 'Image universe character: Adam Booth (Extreme)', 'READY', 'IMAGE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('adam-check-revival-image', 'Adam Check (Revival)', 'CHARACTER', 'Image universe character: Adam Check (Revival)', 'READY', 'IMAGE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('adam-fleming-wildstorm-universe-image', 'Adam Fleming (Wildstorm Universe)', 'CHARACTER', 'Image universe character: Adam Fleming (Wildstorm Universe)', 'READY', 'IMAGE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('adam-rygert-fearless-image', 'Adam Rygert (Fearless)', 'CHARACTER', 'Image universe character: Adam Rygert (Fearless)', 'READY', 'IMAGE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('adam-wilkins-image', 'Adam Wilkins', 'CHARACTER', 'Image universe character: Adam Wilkins', 'READY', 'IMAGE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('addie-vochs-wildstorm-universe-image', 'Addie Vochs (Wildstorm Universe)', 'CHARACTER', 'Image universe character: Addie Vochs (Wildstorm Universe)', 'READY', 'IMAGE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('admonisher-image', 'Admonisher', 'CHARACTER', 'Image universe character: Admonisher', 'READY', 'IMAGE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('asharad-hett-dark-horse', 'A''Sharad Hett', 'CHARACTER', 'Dark_Horse universe character: A''Sharad Hett', 'READY', 'DARK_HORSE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('aayla-secura-dark-horse', 'Aayla Secura', 'CHARACTER', 'Dark_Horse universe character: Aayla Secura', 'READY', 'DARK_HORSE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('abhijat-dark-horse', 'Abhijat', 'CHARACTER', 'Dark_Horse universe character: Abhijat', 'READY', 'DARK_HORSE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('abraham-slamkowski-dark-horse', 'Abraham Slamkowski', 'CHARACTER', 'Dark_Horse universe character: Abraham Slamkowski', 'READY', 'DARK_HORSE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('adi-gallia-dark-horse', 'Adi Gallia', 'CHARACTER', 'Dark_Horse universe character: Adi Gallia', 'READY', 'DARK_HORSE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('agen-kolar-dark-horse', 'Agen Kolar', 'CHARACTER', 'Dark_Horse universe character: Agen Kolar', 'READY', 'DARK_HORSE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('agnes-blones-dark-horse', 'Agnes Blones', 'CHARACTER', 'Dark_Horse universe character: Agnes Blones', 'READY', 'DARK_HORSE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('alan-dark-horse', 'Alan', 'CHARACTER', 'Dark_Horse universe character: Alan', 'READY', 'DARK_HORSE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('aldus-hilltop-next-men-dark-horse', 'Aldus Hilltop (Next Men)', 'CHARACTER', 'Dark_Horse universe character: Aldus Hilltop (Next Men)', 'READY', 'DARK_HORSE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('alice-monaghan-dark-horse', 'Alice Monaghan', 'CHARACTER', 'Dark_Horse universe character: Alice Monaghan', 'READY', 'DARK_HORSE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('alien-queen-dark-horse', 'Alien Queen', 'CHARACTER', 'Dark_Horse universe character: Alien Queen', 'READY', 'DARK_HORSE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('allison-hargreeves-dark-horse', 'Allison Hargreeves', 'CHARACTER', 'Dark_Horse universe character: Allison Hargreeves', 'READY', 'DARK_HORSE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('alucard-dark-horse', 'Alucard', 'CHARACTER', 'Dark_Horse universe character: Alucard', 'READY', 'DARK_HORSE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('amanda-watson-dark-horse', 'Amanda Watson', 'CHARACTER', 'Dark_Horse universe character: Amanda Watson', 'READY', 'DARK_HORSE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('amy-madison-dark-horse', 'Amy Madison', 'CHARACTER', 'Dark_Horse universe character: Amy Madison', 'READY', 'DARK_HORSE', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('list-of-characters-spawn', 'List of characters', 'CHARACTER', 'Spawn universe character: List of characters', 'READY', 'SPAWN', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('agent-connors-spawn', 'Agent Connors', 'CHARACTER', 'Spawn universe character: Agent Connors', 'READY', 'SPAWN', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('agent-roenick-spawn', 'Agent Roenick', 'CHARACTER', 'Spawn universe character: Agent Roenick', 'READY', 'SPAWN', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('alberto-spawn', 'Alberto', 'CHARACTER', 'Spawn universe character: Alberto', 'READY', 'SPAWN', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('amanda-jennings-spawn', 'Amanda Jennings', 'CHARACTER', 'Spawn universe character: Amanda Jennings', 'READY', 'SPAWN', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('anahita-spawn', 'Anahita', 'CHARACTER', 'Spawn universe character: Anahita', 'READY', 'SPAWN', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('andrei-zlenko-spawn', 'Andrei Zlenko', 'CHARACTER', 'Spawn universe character: Andrei Zlenko', 'READY', 'SPAWN', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('andrew-horne-spawn', 'Andrew Horne', 'CHARACTER', 'Spawn universe character: Andrew Horne', 'READY', 'SPAWN', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('andy-spawn', 'Andy', 'CHARACTER', 'Spawn universe character: Andy', 'READY', 'SPAWN', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('andy-frank-spawn', 'Andy Frank', 'CHARACTER', 'Spawn universe character: Andy Frank', 'READY', 'SPAWN', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('angela-spawn', 'Angela', 'CHARACTER', 'Spawn universe character: Angela', 'READY', 'SPAWN', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('anne-thomopoulos-spawn', 'Anne Thomopoulos', 'CHARACTER', 'Spawn universe character: Anne Thomopoulos', 'READY', 'SPAWN', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('antonio-twistelli-spawn', 'Antonio Twistelli', 'CHARACTER', 'Spawn universe character: Antonio Twistelli', 'READY', 'SPAWN', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('avenging-angel-of-the-fifth-heaven-spawn', 'Avenging Angel of the Fifth Heaven', 'CHARACTER', 'Spawn universe character: Avenging Angel of the Fifth Heaven', 'READY', 'SPAWN', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('badrock-spawn', 'Badrock', 'CHARACTER', 'Spawn universe character: Badrock', 'READY', 'SPAWN', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('angel-scream-transformers', '"Angel" Scream', 'CHARACTER', 'Transformers universe character: "Angel" Scream', 'READY', 'TRANSFORMERS', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('abominus-rid-transformers', 'Abominus (RID)', 'CHARACTER', 'Transformers universe character: Abominus (RID)', 'READY', 'TRANSFORMERS', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('abominus-tfp-transformers', 'Abominus TFP', 'CHARACTER', 'Transformers universe character: Abominus TFP', 'READY', 'TRANSFORMERS', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('abraham-lincoln-tfp-transformers', 'Abraham Lincoln TFP', 'CHARACTER', 'Transformers universe character: Abraham Lincoln TFP', 'READY', 'TRANSFORMERS', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('acid-storm-cyberverse-transformers', 'Acid Storm (Cyberverse)', 'CHARACTER', 'Transformers universe character: Acid Storm (Cyberverse)', 'READY', 'TRANSFORMERS', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('ada-lovelace-transformers', 'Ada Lovelace', 'CHARACTER', 'Transformers universe character: Ada Lovelace', 'READY', 'TRANSFORMERS', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('aegis-vanguard-transformers', 'Aegis Vanguard', 'CHARACTER', 'Transformers universe character: Aegis Vanguard', 'READY', 'TRANSFORMERS', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('aerialbots-tfp-transformers', 'Aerialbots TFP', 'CHARACTER', 'Transformers universe character: Aerialbots TFP', 'READY', 'TRANSFORMERS', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('aerobolt-transformers', 'Aerobolt', 'CHARACTER', 'Transformers universe character: Aerobolt', 'READY', 'TRANSFORMERS', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('afterburner-cyberverse-transformers', 'Afterburner (Cyberverse)', 'CHARACTER', 'Transformers universe character: Afterburner (Cyberverse)', 'READY', 'TRANSFORMERS', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('afterburner-tfp-transformers', 'Afterburner TFP', 'CHARACTER', 'Transformers universe character: Afterburner TFP', 'READY', 'TRANSFORMERS', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('agent-schloder-earthspark-transformers', 'Agent Schloder (EarthSpark)', 'CHARACTER', 'Transformers universe character: Agent Schloder (EarthSpark)', 'READY', 'TRANSFORMERS', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('aimless-tfp-transformers', 'Aimless TFP', 'CHARACTER', 'Transformers universe character: Aimless TFP', 'READY', 'TRANSFORMERS', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('air-raid-tfp-transformers', 'Air Raid TFP', 'CHARACTER', 'Transformers universe character: Air Raid TFP', 'READY', 'TRANSFORMERS', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('airachnid-one-transformers', 'Airachnid (One)', 'CHARACTER', 'Transformers universe character: Airachnid (One)', 'READY', 'TRANSFORMERS', 'Canon', '', '')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('infinity-gauntlet-marvel', 'Infinity Gauntlet', 'ITEM', 'Cosmic artifact designed to hold the six Infinity Gems, granting omnipotence over reality.', 'READY', 'MARVEL', 'Earth-616', 'Jim Starlin; Ron Lim', 'Silver Surfer Vol 3 44')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('mjolnir-marvel', 'Mjolnir', 'ITEM', 'Enchanted hammer forged by Dwarven blacksmiths from Uru metal, wielded by Thor Odinson.', 'READY', 'MARVEL', 'Earth-616', 'Stan Lee; Jack Kirby', 'Journey Into Mystery Vol 1 83')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('iron-man-armor-model-1-marvel', 'Iron Man Armor Model 1', 'ITEM', 'First powered armor built by Tony Stark and Ho Yinsen to survive captivity and escape.', 'READY', 'MARVEL', 'Earth-616', 'Stan Lee; Jack Kirby; Don Heck', 'Tales of Suspense Vol 1 39')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('destroyer-marvel', 'Destroyer', 'ITEM', 'Enchanted suit of Asgardian armor forged by Odin to combat the Fourth Host of Celestials.', 'READY', 'MARVEL', 'Earth-616', 'Stan Lee; Jack Kirby', 'Journey Into Mystery Vol 1 118')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('dreadnought-marvel', 'Dreadnought', 'ITEM', 'Robotic combat unit engineered by Hydra, utilizing titanium alloy and heavy ballistics.', 'READY', 'MARVEL', 'Earth-616', 'Jim Steranko', 'Strange Tales Vol 1 154')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('batmobile-dc', 'Batmobile', 'ITEM', 'Tactical combat pursuit vehicle developed by Batman and Wayne Enterprises.', 'READY', 'DC', 'Prime Earth', 'Bill Finger; Bob Kane', 'Detective Comics Vol 1 35')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('batarang-dc', 'Batarang', 'ITEM', 'Signature bat-shaped throwing weapon deployed by Batman for non-lethal neutralization.', 'READY', 'DC', 'Prime Earth', 'Gardner Fox; Bob Kane', 'Detective Comics Vol 1 31')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('lasso-of-truth-dc', 'Lasso of Truth', 'ITEM', 'Golden lasso forged by Hephaestus, compelling absolute truth and obedience.', 'READY', 'DC', 'Prime Earth', 'William Moulton Marston; Harry G. Peter', 'Sensation Comics Vol 1 6')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('green-lantern-power-battery-dc', 'Green Lantern Power Battery', 'ITEM', 'Lantern conduit linked to the Central Power Battery on Oa, recharging Green Lantern power rings.', 'READY', 'DC', 'Prime Earth', 'John Broome; Gil Kane', 'Showcase Vol 1 22')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('baxter-building-marvel', 'Baxter Building', 'LOCATION', '35-story skyscraper in Manhattan serving as the headquarters of the Fantastic Four.', 'READY', 'MARVEL', 'Earth-616', 'Stan Lee; Jack Kirby', 'Fantastic Four Vol 1 3')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('asgard-marvel', 'Asgard', 'LOCATION', 'Dimensional realm of the Norse Gods, home to Odin, Thor, and the Golden Realm.', 'READY', 'MARVEL', 'Earth-616', 'Stan Lee; Larry Lieber; Jack Kirby', 'Journey Into Mystery Vol 1 85')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('wakanda-marvel', 'Wakanda', 'LOCATION', 'Advanced East African sovereign nation and source of the world''s Great Mound of Vibranium.', 'READY', 'MARVEL', 'Earth-616', 'Stan Lee; Jack Kirby', 'Fantastic Four Vol 1 52')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('latveria-marvel', 'Latveria', 'LOCATION', 'Isolated Eastern European monarchy ruled with an iron fist by Doctor Victor von Doom.', 'READY', 'MARVEL', 'Earth-616', 'Stan Lee; Jack Kirby', 'Fantastic Four Annual Vol 1 2')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('avengers-mansion-marvel', 'Avengers Mansion', 'LOCATION', 'Historic townhouse on Fifth Avenue donated by Tony Stark to serve as Avengers base.', 'READY', 'MARVEL', 'Earth-616', 'Stan Lee; Jack Kirby', 'Avengers Vol 1 2')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('attilan-marvel', 'Attilan', 'LOCATION', 'Ancestral refuge and mobile floating city of the Inhuman royal family and race.', 'READY', 'MARVEL', 'Earth-616', 'Stan Lee; Jack Kirby', 'Fantastic Four Vol 1 47')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('gotham-city-dc', 'Gotham City', 'LOCATION', 'Metropolitan center in New Jersey rife with crime and corporate corruption, guarded by Batman.', 'READY', 'DC', 'Prime Earth', 'Bill Finger; Bob Kane', 'Batman Vol 1 4')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('metropolis-dc', 'Metropolis', 'LOCATION', 'City of Tomorrow, gleaming economic capital protected by Superman.', 'READY', 'DC', 'Prime Earth', 'Jerry Siegel; Joe Shuster', 'Action Comics #16')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('batcave-dc', 'Batcave', 'LOCATION', 'Subterranean headquarters beneath Wayne Manor housing Batman''s supercomputer, laboratory, and vehicles.', 'READY', 'DC', 'Prime Earth', 'Bill Finger; Bob Kane', 'Batman Vol 1 12')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('daily-planet-dc', 'Daily Planet', 'LOCATION', 'Leading metropolitan newspaper publisher where Clark Kent, Lois Lane, and Jimmy Olsen work.', 'READY', 'DC', 'Prime Earth', 'Jerry Siegel; Joe Shuster', 'Action Comics Vol 1 23')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('arkham-asylum-dc', 'Arkham Asylum', 'LOCATION', 'Psychiatric hospital in Gotham City where Batman''s criminally insane adversaries are detained.', 'READY', 'DC', 'Prime Earth', 'Dennis O''Neil; Irv Novick', 'Batman Vol 1 258')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe, reality, creators, first_appearance)
VALUES ('central-city-dc', 'Central City', 'LOCATION', 'Midwestern city home to Barry Allen, the Silver Age Flash.', 'READY', 'DC', 'Prime Earth', 'Robert Kanigher; Carmine Infantino', 'Showcase Vol 1 4')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe, reality = EXCLUDED.reality, creators = EXCLUDED.creators, first_appearance = EXCLUDED.first_appearance;

