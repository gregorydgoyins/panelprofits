-- Multi-Universe Character Wiki Foundation Seed (Sample Premier Characters)
-- Inserts canonical character dossiers into ppcf_wiki_pages

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('emil-blonsky-earth-616', 'Abomination', 'CHARACTER', 'Human Gamma Mutate', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('corey-flynn-earth-616', 'Absalom', 'CHARACTER', 'Marvel Universe character: Absalom', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('carl-creel-earth-616', 'Absorbing Man', 'CHARACTER', 'Human enhanced by Loki; later transformed using gamma energy but was eventually depowered', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('adam-warlock-earth-616', '| Title = Warlock', 'CHARACTER', 'Marvel Universe character: | Title = Warlock', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('adam-neramani-earth-616', 'Adam-X', 'CHARACTER', 'Shi''ar/Mutant hybrid', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('eric-cameron-earth-616', 'Adonis', 'CHARACTER', '| Reality = Earth-616', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('adri-nital-earth-616', '| Aliases =', 'CHARACTER', 'Marvel Universe character: | Aliases =', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('adversary-earth-616', '* The Great TricksterOfficial Handbook of the Marvel Universe Update ''89 Vol 1 1 * Sefako the Twice-Risen GodBlack Panther Vol 6 171', 'CHARACTER', 'Demonic GodMarvel Encyclopedia Vol 1 1|; 2009 edition', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('aeroika-earth-616', 'Aeroika', 'CHARACTER', 'Winged One', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('agatha-harkness-earth-616', '| Titles = * True Sorcerer SupremeSorcerer Supreme Vol 1 2', 'CHARACTER', 'Marvel Universe character: | Titles = * True Sorcerer SupremeSorcerer Supreme Vol 1 2', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('agent-axis-earth-616', 'Agent Axis', 'CHARACTER', 'Marvel Universe character: Agent Axis', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('cynthia-glass-earth-616', 'Agent X', 'CHARACTER', 'Marvel Universe character: Agent X', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('christoph-nord-earth-616', 'Maverick', 'CHARACTER', 'Mutant (''''see notes''''); formerly VampireWolverine: Blood Hunt Vol 1 4', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('aginar-earth-616', '| Aliases =', 'CHARACTER', 'Eternal', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('agon-earth-616', 'King Agon', 'CHARACTER', 'Marvel Universe character: King Agon', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('agron-earth-76216', '| Aliases = Agron the Unliving', 'CHARACTER', 'Marvel Universe character: | Aliases = Agron the Unliving', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alejandro-montoya-earth-616', 'El Águila', 'CHARACTER', 'MutantNew Avengers Vol 1 18Power Man and Iron Fist Vol 2 2', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('gabriel-lan-earth-616', 'Air-Walker', 'CHARACTER', 'Xandarian transformed into Air-Walker by Galactus', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('air-walker-automaton-earth-616', '| Aliases = Gabriel', 'CHARACTER', 'Marvel Universe character: | Aliases = Gabriel', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('ajak-earth-616', 'Ajak Celestia', 'CHARACTER', 'Marvel Universe character: Ajak Celestia', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('thomas-jones-earth-616', 'Alchemy', 'CHARACTER', 'Marvel Universe character: Alchemy', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('allatou-earth-616', '| Aliases =', 'CHARACTER', 'Demon', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alpha-mutant-earth-616', 'Alpha the Ultimate Mutant', 'CHARACTER', 'Artificial Mutant, bioengineered by Magneto', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('marlene-alraune-earth-616', '| Aliases = * Marlene FontaineMarvel Spotlight Vol 1 28 * Mary SandsMoon Knight Vol 1 19', 'CHARACTER', 'Marvel Universe character: | Aliases = * Marlene FontaineMarvel Spotlight Vol 1 28 * Mary SandsMoon Knight Vol 1 19', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('amaa-earth-616', '| Aliases =', 'CHARACTER', 'Marvel Universe character: | Aliases =', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('ambur-earth-616', '| Aliases = Queen AmburIVX Vol 1 1', 'CHARACTER', 'Marvel Universe character: | Aliases = Queen AmburIVX Vol 1 1', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('jason-strongbow-earth-616', 'American Eagle', 'CHARACTER', 'Marvel Universe character: American Eagle', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('lyle-dekker-earth-616', 'Ameridroid', 'CHARACTER', 'Marvel Universe character: Ameridroid', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('ammo-earth-616', '| Affiliation = Munition Militia Formerly: leader of the Wildboys', 'CHARACTER', '| Reality = 616', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('kingsley-rice-earth-712', 'Amphibian', 'CHARACTER', 'Mutant', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('amphibius-earth-616', '| Affiliation = Savage Land Mutates Formerly: Swamp Men', 'CHARACTER', 'Mutate from the Savage Land', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('blanche-sitznski-earth-616', 'Anaconda', 'CHARACTER', 'Human Mutate (Bioengineered to have various permanent serpentine adaptations)Category:Genetically Engineered', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('tike-alicar-earth-616', 'Anarchist', 'CHARACTER', 'Marvel Universe character: Anarchist', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('yao-earth-616', 'Ancient One', 'CHARACTER', 'Marvel Universe character: Ancient One', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('andromeda-attumasen-earth-616', '| Aliases = * Andrea McPheeNew Defenders Vol 1 145 * Genevieve CrossDoctor Strange, Sorcerer Supreme Vol 1 3|4 * Andromeda the SwordFantastic Four Vol 3 578', 'CHARACTER', 'Atlantean', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('david-angar-earth-616', 'Angar the Screamer', 'CHARACTER', 'Marvel Universe character: Angar the Screamer', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('thomas-halloway-earth-616', 'Angel', 'CHARACTER', 'Marvel Universe character: Angel', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('simon-halloway-earth-616', 'Angel', 'CHARACTER', 'Marvel Universe character: Angel', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('warren-worthington-iii-earth-616', 'Archangel', 'CHARACTER', 'Mutant (purportedly Cheyarafim throwback);Marvel Zombies: The Book of Angels, Demons & Various Monstrosities Vol 1 1|; Angels'' entry later granted Techno-Organic wings by Apocalypse on his Celestial Ship, then reborn from the Celestial Seed', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('angel-salvadore-earth-616', 'Tempest', 'CHARACTER', 'Mutant', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('frederick-animus-earth-616', 'Ani-Mator', 'CHARACTER', 'Marvel Universe character: Ani-Mator', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('annihilus-earth-616', '| Nicknames = * Bug-ManWarlock Vol 4 4', 'CHARACTER', 'Arthrosian', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('john-anvil-earth-616', 'Anvil', 'CHARACTER', 'Marvel Universe character: Anvil', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('en-sabah-nur-earth-616', 'Apocalypse', 'CHARACTER', 'Mutant ExternalX-Men: Future History: Messiah War Sourcebook Vol 1 1X-Men Forever Vol 1 4Powers of X Vol 1 3 turned Cyborg', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('wundarr-earth-616', 'Aquarian', 'CHARACTER', 'Marvel Universe character: Aquarian', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('darren-bentley-earth-616', 'One-Man Zodiac', 'CHARACTER', 'Marvel Universe character: One-Man Zodiac', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('zachary-drebb-earth-616', 'Aquarius', 'CHARACTER', 'Marvel Universe character: Aquarius', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('aragorn-earth-616', '| Aliases = PegasusAvengers Vol 1 48', 'CHARACTER', 'Mutated Horse', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('arcade-earth-616', 'Arcade', 'CHARACTER', 'Human enhanced through cybernetics, magic artifacts, Stark technology and gamma radiation.Avengers Arena Vol 1 7', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('arcanna-jones-earth-712', 'Moonglow', 'CHARACTER', 'Marvel Universe character: Moonglow', 'READY', 'MARVEL')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('barry-allen-new-earth', 'The Flash', 'CHARACTER', 'DC Universe character: The Flash', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('jason-garrick-new-earth', 'The Flash', 'CHARACTER', 'DC Universe character: The Flash', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('eobard-thawne-new-earth', 'Professor Zoom', 'CHARACTER', 'DC Universe character: Professor Zoom', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('bruce-wayne-new-earth', 'Batman', 'CHARACTER', 'DC Universe character: Batman', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('bart-allen-new-earth', 'Kid Flash', 'CHARACTER', 'DC Universe character: Kid Flash', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('max-mercury-new-earth', 'Max Mercury', 'CHARACTER', 'DC Universe character: Max Mercury', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('jason-todd-new-earth', 'Red Hood', 'CHARACTER', 'DC Universe character: Red Hood', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('donna-troy-new-earth', 'Donna Troy', 'CHARACTER', 'DC Universe character: Donna Troy', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('lana-lang-new-earth', 'Lana Lang', 'CHARACTER', 'DC Universe character: Lana Lang', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('timothy-drake-new-earth', 'Red Robin', 'CHARACTER', 'DC Universe character: Red Robin', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('stephanie-brown-new-earth', 'Batgirl', 'CHARACTER', 'DC Universe character: Batgirl', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('arthur-brown-new-earth', 'Cluemaster', 'CHARACTER', 'DC Universe character: Cluemaster', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('joker-new-earth', 'The Joker', 'CHARACTER', 'DC Universe character: The Joker', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alfred-pennyworth-new-earth', 'Alfred Pennyworth', 'CHARACTER', 'DC Universe character: Alfred Pennyworth', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('hal-jordan-new-earth', 'Green Lantern', 'CHARACTER', 'DC Universe character: Green Lantern', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alan-scott-new-earth', 'Green Lantern', 'CHARACTER', 'DC Universe character: Green Lantern', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('edward-nashton-new-earth', 'The Riddler', 'CHARACTER', 'DC Universe character: The Riddler', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('oswald-cobblepot-new-earth', 'The Penguin', 'CHARACTER', 'DC Universe character: The Penguin', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('bane-new-earth', 'Bane', 'CHARACTER', 'DC Universe character: Bane', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('pamela-isley-new-earth', 'Poison Ivy', 'CHARACTER', 'DC Universe character: Poison Ivy', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('silver-st-cloud-new-earth', '| Aliases =', 'CHARACTER', 'DC Universe character: | Aliases =', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('ras-al-ghul-new-earth', 'Ra''s al Ghul', 'CHARACTER', 'DC Universe character: Ra''s al Ghul', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('lucius-fox-new-earth', '| Aliases =', 'CHARACTER', 'DC Universe character: | Aliases =', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('jean-paul-valley-new-earth', 'Azrael', 'CHARACTER', 'DC Universe character: Azrael', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('harleen-quinzel-new-earth', 'Harley Quinn', 'CHARACTER', 'DC Universe character: Harley Quinn', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('jervis-tetch-new-earth', 'Mad Hatter', 'CHARACTER', 'DC Universe character: Mad Hatter', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('harvey-dent-new-earth', 'Two-Face', 'CHARACTER', 'DC Universe character: Two-Face', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('basil-karlo-new-earth', 'Clayface', 'CHARACTER', 'DC Universe character: Clayface', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('matthew-hagen-new-earth', 'Clayface', 'CHARACTER', 'DC Universe character: Clayface', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('preston-payne-new-earth', 'Clayface', 'CHARACTER', 'DC Universe character: Clayface', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('cassius-payne-new-earth', 'Clayface', 'CHARACTER', 'DC Universe character: Clayface', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('john-stewart-new-earth', 'Green Lantern', 'CHARACTER', 'DC Universe character: Green Lantern', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('guy-gardner-new-earth', 'Green Lantern', 'CHARACTER', 'DC Universe character: Green Lantern', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alexander-luthor-new-earth', 'Lex Luthor', 'CHARACTER', 'DC Universe character: Lex Luthor', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('theodore-kord-new-earth', 'Blue Beetle', 'CHARACTER', 'DC Universe character: Blue Beetle', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('jean-loring-new-earth', '| Aliases = Eclipso', 'CHARACTER', 'DC Universe character: | Aliases = Eclipso', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('susan-dearbon-new-earth', 'Sue Dibny', 'CHARACTER', 'DC Universe character: Sue Dibny', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('ralph-dibny-new-earth', 'Elongated Man', 'CHARACTER', 'DC Universe character: Elongated Man', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('jonn-jonzz-new-earth', 'Martian Manhunter', 'CHARACTER', 'DC Universe character: Martian Manhunter', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('orin-new-earth', 'Aquaman', 'CHARACTER', 'DC Universe character: Aquaman', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('henry-heywood-iii-new-earth', 'Steel', 'CHARACTER', 'DC Universe character: Steel', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('perry-white-new-earth', 'Perry White', 'CHARACTER', 'DC Universe character: Perry White', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('peter-ross-new-earth', 'Pete Ross', 'CHARACTER', 'DC Universe character: Pete Ross', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('sasha-bordeaux-new-earth', '| Distinguish1 =', 'CHARACTER', 'DC Universe character: | Distinguish1 =', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('cassandra-cain-new-earth', 'Batgirl', 'CHARACTER', 'DC Universe character: Batgirl', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('vesper-fairchild-new-earth', 'Vesper Fairchild', 'CHARACTER', 'DC Universe character: Vesper Fairchild', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('garfield-lynns-new-earth', 'Firefly', 'CHARACTER', 'DC Universe character: Firefly', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('sandra-wu-san-new-earth', 'Lady Shiva', 'CHARACTER', 'DC Universe character: Lady Shiva', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('lori-lemaris-earth-one', '| Aliases =', 'CHARACTER', 'DC Universe character: | Aliases =', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('doomsday-new-earth', 'Doomsday', 'CHARACTER', 'DC Universe character: Doomsday', 'READY', 'DC')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('brianna', 'Brianna', 'CHARACTER', 'Homeworld: |birth=3976 BBY · Affiliation: Jedi', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('atris', 'Atris<br />', 'CHARACTER', 'Homeworld: |birth= · Affiliation: *Jedi Order **Jedi High Council **Lost Jedi *Galactic Republic', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('meetra-surik', 'Meetra Surik<br />"Jedi Exile"', 'CHARACTER', 'Species: Human · Homeworld: Dantooine · Affiliation: *Jedi Order exiled *Onderon Royalists', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('ainlee-teemlegends', 'Ainlee Teem', 'CHARACTER', 'Species: Gran · Homeworld: Malastare · Affiliation: *Galactic Republic **Galactic Senate', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('palpatinelegends', 'Palpatine<br />Darth Sidious', 'CHARACTER', 'Species: Human Naboo · Homeworld: Naboo · Affiliation: *Damask Holdings *Galactic Republic *Galactic Empire *Dark Empire **Dark Side Elite', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('aayla-securalegends', 'Aayla Secura', 'CHARACTER', 'Species: Twi''lek Rutian · Homeworld: Ryloth · Affiliation: *Jedi Order **Blue Squadron', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('firmus-piettlegends', 'Firmus Piett', 'CHARACTER', 'Species: Human · Homeworld: Axxila · Affiliation: *Axxila antipirate fleet *Galactic Empire **Imperial Navy ***Death Squadron', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('firmus-piett', 'Firmus Piett', 'CHARACTER', 'Species: Human · Homeworld: Axxila · Affiliation: Galactic Empire', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('sevrance-tannlegends', 'Sev''rance Tann', 'CHARACTER', 'Species: Chiss · Homeworld: Csilla · Affiliation: *Chiss Ascendancy **Chiss Academy *Confederacy of Independent Systems **Confederacy military', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('jango-fettlegends', 'Jango Fett', 'CHARACTER', 'Species: Human · Homeworld: Concord Dawn · Affiliation: *Mandalorians **True Mandalorians *Galactic Republic *Confederacy of Independent Systems', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('blylegends', 'Bly<br />CC-5052', 'CHARACTER', 'Species: Human clone · Homeworld: Kamino · Affiliation: *Galactic Republic *Galactic Empire', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('passel-argentelegends', 'Passel Argente', 'CHARACTER', 'Species: Koorivar · Homeworld: Kooriva · Affiliation: *Confederacy of Independent Systems **Separatist Council *Corporate Alliance **Lethe Merchandising *Galactic Republic **Galactic Senate', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('dookulegends', 'Dooku<br />Darth Tyranus', 'CHARACTER', 'Species: Human · Homeworld: Serenno · Affiliation: Sith', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('obi-wan-kenobilegends', 'Obi-Wan Kenobi', 'CHARACTER', 'Species: Human · Homeworld: Stewjon · Affiliation: Jedi', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('luke-skywalkerlegends', 'Luke Skywalker', 'CHARACTER', 'Species: Human · Homeworld: Tatooine · Affiliation: *Alliance to Restore the Republic **Endor strike team *Jedi Order *Bright Tree Village *Order of the Sith Lords briefly *Dark Empire briefly **Saber Squadron **Twin Suns Squadron **Blackmoon Squadron **StealthX wing *Jedi Coalition *Galactic Federation of Free Alliances', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('han-sololegends', 'Han Solo', 'CHARACTER', 'Homeworld: Corellia · Affiliation: *Imperial Marines *Galactic Empire *Hutt Cartel *Alliance of Free Planets *New Republic *Bright Tree Village *Independent Shippers Association *Galactic Federation of Free Alliances *Five Worlds, later Confederation *Jedi Coalition', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('padmé-amidalalegends', 'Padmé Amidala', 'CHARACTER', 'Species: Human Naboo · Homeworld: Naboo · Affiliation: *Refugee Relief Movement *Apprentice Legislature ***Delegation of 2000 *Galactic Empire **Imperial Senate', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('yodalegends', 'Yoda', 'CHARACTER', 'Species: Yoda''s species · Homeworld: |birth=896 BBY 861BrS · Affiliation: *Jedi Order *Galactic Republic', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('qui-gon-jinnlegends', 'Qui-Gon Jinn', 'CHARACTER', 'Species: Human · Homeworld: Unidentified planet · Affiliation: *Alaris Prime colonists *Jedi Order **Old Guard *Galactic Republic', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('nute-gunraylegends', 'Nute Gunray', 'CHARACTER', 'Species: Neimoidian · Homeworld: Neimoidia · Affiliation: *Nute hive *Neimoidian Inner Circle *Trade Federation *Order of the Sith Lords **Separatist Council', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('leia-organa-sololegends', 'Leia Organa Solo', 'CHARACTER', 'Species: Human · Homeworld: Alderaan · Affiliation: *Galactic Empire *Alliance to Restore the Republic *New Republic *Galactic Federation of Free Alliances *Five Worlds *Jedi Coalition', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('boba-fettlegends', 'Boba Fett', 'CHARACTER', 'Species: Human clone · Homeworld: Kamino · Affiliation: *Journeyman Protectors *Jabba Desilijic Tiure''s criminal empire *Bounty Hunters'' Guild as an infiltrator *Mandalorians **Mandalorian Protectors *Yuuzhan Vong Empire as a spy *Galactic Federation of Free Alliances **Jedi Coalition', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('grievouslegends', 'Grievous', 'CHARACTER', 'Species: Kaleesh · Homeworld: Kalee · Affiliation: *Kolkpravis *InterGalactic Banking Clan *Confederacy of Independent Systems **Separatist Droid Army', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('darth-maullegends', 'Darth Maul', 'CHARACTER', 'Species: Dathomirian Zabrak · Homeworld: Dathomir; also raised on Mustafar · Affiliation: Sith', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('bail-prestor-organalegends', 'Bail Prestor Organa', 'CHARACTER', 'Species: Human Alderaanian · Homeworld: Alderaan · Affiliation: *High Court of Alderaan *Galactic Republic ***Delegation of 2000 *Galactic Empire **Imperial Senate *Kota''s Militia *Alliance to Restore the Republic', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('chewbaccalegends', 'Chewbacca', 'CHARACTER', 'Species: Wookiee Rwook · Homeworld: Kashyyyk · Affiliation: *Alaris Prime colonists *Alliance to Restore the Republic *Galactic Republic *New Republic *Han Solo and his family life debt *Bright Tree Village', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('lando-calrissianlegends', 'Lando Calrissian', 'CHARACTER', 'Homeworld: Socorro · Affiliation: *Alliance to Restore the Republic **Raptor Squad **Gold Group *New Republic', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('wilhuff-tarkinlegends', 'Wilhuff Tarkin', 'CHARACTER', 'Species: Human · Homeworld: Eriadu · Affiliation: *Tarkin family *Galactic Republic ***Republic Outland Regions Security Force *Galactic Empire **Imperial Navy **Battle Station Command **Imperial Department of Military Research **Imperial High Command', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('finis-valorumlegends', 'Finis Valorum', 'CHARACTER', 'Homeworld: Coruscant · Affiliation: Galactic Republic', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('kalpana-supreme-chancellorlegends', 'Kalpana (Supreme Chancellor)', 'CHARACTER', 'Homeworld: |birth= · Affiliation: *Galactic Republic **Galactic Senate **Office of the Supreme Chancellor', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('darth-banelegends', 'Darth Bane<br />Dessel', 'CHARACTER', 'Species: Human · Homeworld: Apatros Ciutric IV (adopted) · Affiliation: Sith', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('amanamanlegends', 'Amanaman', 'CHARACTER', 'Species: Amani · Homeworld: Maridun · Affiliation: Jabba''s criminal empire', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('bail-antilleslegends', 'Bail Antilles', 'CHARACTER', 'Species: Human Alderaanian · Homeworld: Alderaan · Affiliation: *Galactic Republic **Internal Activities Committee **Core faction **Alderaan Senatorial Delegation', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('tion-medonlegends', 'Tion Medon', 'CHARACTER', 'Homeworld: Utapau · Affiliation: *Confederacy of Independent Systems *Galactic Republic *Utapauan Committee *Utapaun resistance', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('bogalegends', 'Boga', 'CHARACTER', 'Species: Varactyl · Homeworld: Utapau · Affiliation: Pau City', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('lampay-faylegends', 'Lampay Fay', 'CHARACTER', 'Species: Pau''an · Homeworld: Utapau · Affiliation: *Galactic Republic *Pau City', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('jabba-desilijic-tiurelegends', 'Jabba Desilijic Tiure', 'CHARACTER', 'Species: Hutt · Homeworld: Nal Hutta · Affiliation: *Hutt Cartel **Hutt Ruling Council **Jabba Desilijic Tiure''s criminal empire *Shadow Collective briefly', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('wedge-antilleslegends', 'Wedge Antilles', 'CHARACTER', 'Homeworld: Corellia Gus Treta Inner-System Market Station · Affiliation: *Alliance to Restore the Republic **Raptor Squad *Alliance of Free Planets *New Republic **Fleet Group Three *Galactic Federation of Free Alliances *Antilles''s Rogues *Five Worlds *Jedi Coalition **Rakehell Squadron', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('jar-jar-binkslegends', 'Jar Jar Binks', 'CHARACTER', 'Homeworld: Naboo · Affiliation: Galactic Empire', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('exar-kunlegends', 'Exar Kun', 'CHARACTER', 'Species: Human · Homeworld: |birth= · Affiliation: *Galactic Republic **Sith Empire', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('revanlegends', 'Revan<br />Darth Revan', 'CHARACTER', 'Species: Human · Homeworld: |birth=c. 3994 BBY, Outer Rim believed · Affiliation: *Jedi Order **Revanchists **Republic Military **Darth Revan''s Sith Empire', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('bastila-shan', 'Bastila Shan', 'CHARACTER', 'Homeworld: Talravin · Affiliation: *Jedi Order **Jedi strike team *Galactic Republic **Republic Navy *Darth Malak''s Sith Empire Briefly', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('darth-nihilus', 'Darth Nihilus', 'CHARACTER', 'Species: Human later dark side aberration · Homeworld: |birth= · Affiliation: *Sith **Sith Triumvirate', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('darth-malak', 'Darth Malak<br />Alek', 'CHARACTER', 'Species: Human · Homeworld: Quelii · Affiliation: Sith', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('gial-ackbarlegends', 'Gial Ackbar', 'CHARACTER', 'Species: Mon Calamari · Homeworld: Dac · Affiliation: *Ackbar family *Mon Calamari Guard *Mon Calamari Resistance *Alliance to Restore the Republic *New Republic *Galactic Federation of Free Alliances', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('shmi-skywalker-larslegends', 'Shmi Skywalker Lars', 'CHARACTER', 'Species: Human · Homeworld: Tatooine · Affiliation: *Gardulla the Elder''s criminal empire enslaved', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('freedon-nadd', 'Freedon Nadd', 'CHARACTER', 'Species: Human · Homeworld: Onderon Adopted · Affiliation: *Jedi Order *Onderon Royal Family', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('maximilian-veerslegends', 'Maximilian Veers', 'CHARACTER', 'Species: Human · Homeworld: Denon · Affiliation: *Galactic Empire **Academy of Carida *Thrawn''s confederation *Dark Empire', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('xizorlegends', 'Xizor', 'CHARACTER', 'Species: Falleen · Homeworld: Falleen · Affiliation: Criminal', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('mara-jade-skywalker', 'Mara Jade Skywalker', 'CHARACTER', 'Species: Human · Homeworld: |birth=17 BBY · Affiliation: *Galactic Empire *New Jedi Order *Galactic Federation of Free Alliances', 'READY', 'STAR_WARS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('aj-ritter-image', 'A.J. Ritter', 'CHARACTER', 'Image universe character: A.J. Ritter', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('aaron-the-walking-dead-image', 'Aaron (The Walking Dead)', 'CHARACTER', 'Image universe character: Aaron (The Walking Dead)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('aaron-weimar-revival-image', 'Aaron Weimar (Revival)', 'CHARACTER', 'Image universe character: Aaron Weimar (Revival)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('aaron-wilkes-sons-of-the-devil-image', 'Aaron Wilkes (Sons of the Devil)', 'CHARACTER', 'Image universe character: Aaron Wilkes (Sons of the Devil)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('ab-image', 'Ab', 'CHARACTER', 'Image universe character: Ab', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('ab-death-wildstorm-universe-image', 'Ab-Death (Wildstorm Universe)', 'CHARACTER', 'Image universe character: Ab-Death (Wildstorm Universe)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('abaddon-image', 'Abaddon', 'CHARACTER', 'Image universe character: Abaddon', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('abbey-chase-image', 'Abbey Chase', 'CHARACTER', 'Image universe character: Abbey Chase', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('abdiel-image', 'Abdiel', 'CHARACTER', 'Image universe character: Abdiel', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('abel-spawn-image', 'Abel (Spawn)', 'CHARACTER', 'Image universe character: Abel (Spawn)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('abigail-barker-nailbiter-image', 'Abigail Barker (Nailbiter)', 'CHARACTER', 'Image universe character: Abigail Barker (Nailbiter)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('abigail-van-alstine-top-cow-image', 'Abigail van Alstine (Top Cow)', 'CHARACTER', 'Image universe character: Abigail van Alstine (Top Cow)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('abraham-ford-the-walking-dead-image', 'Abraham Ford (The Walking Dead)', 'CHARACTER', 'Image universe character: Abraham Ford (The Walking Dead)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('adam-booth-extreme-image', 'Adam Booth (Extreme)', 'CHARACTER', 'Image universe character: Adam Booth (Extreme)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('adam-check-revival-image', 'Adam Check (Revival)', 'CHARACTER', 'Image universe character: Adam Check (Revival)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('adam-fleming-wildstorm-universe-image', 'Adam Fleming (Wildstorm Universe)', 'CHARACTER', 'Image universe character: Adam Fleming (Wildstorm Universe)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('adam-rygert-fearless-image', 'Adam Rygert (Fearless)', 'CHARACTER', 'Image universe character: Adam Rygert (Fearless)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('adam-wilkins-image', 'Adam Wilkins', 'CHARACTER', 'Image universe character: Adam Wilkins', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('addie-vochs-wildstorm-universe-image', 'Addie Vochs (Wildstorm Universe)', 'CHARACTER', 'Image universe character: Addie Vochs (Wildstorm Universe)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('admonisher-image', 'Admonisher', 'CHARACTER', 'Image universe character: Admonisher', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('adolf-hitler-the-manhattan-projects-image', 'Adolf Hitler (The Manhattan Projects)', 'CHARACTER', 'Image universe character: Adolf Hitler (The Manhattan Projects)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('adolf-hitler-wildstorm-universe-image', 'Adolf Hitler (Wildstorm Universe)', 'CHARACTER', 'Image universe character: Adolf Hitler (Wildstorm Universe)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('adrianna-tereshkova-image', 'Adrianna Tereshkova', 'CHARACTER', 'Image universe character: Adrianna Tereshkova', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('agatha-head-lopper-image', 'Agatha (Head Lopper)', 'CHARACTER', 'Image universe character: Agatha (Head Lopper)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('agent-hunter-image', 'Agent Hunter', 'CHARACTER', 'Image universe character: Agent Hunter', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('agent-orange-image', 'Agent Orange', 'CHARACTER', 'Image universe character: Agent Orange', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('agent-orange-wildstorm-universe-image', 'Agent Orange (Wildstorm Universe)', 'CHARACTER', 'Image universe character: Agent Orange (Wildstorm Universe)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('agent-roenick-image', 'Agent Roenick', 'CHARACTER', 'Image universe character: Agent Roenick', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('agent-silva-image', 'Agent Silva', 'CHARACTER', 'Image universe character: Agent Silva', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('ajeet-singh-wildstorm-universe-image', 'Ajeet Singh (Wildstorm Universe)', 'CHARACTER', 'Image universe character: Ajeet Singh (Wildstorm Universe)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alabastar-wu-image', 'Alabastar Wu', 'CHARACTER', 'Image universe character: Alabastar Wu', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alan-keever-extreme-image', 'Alan Keever (Extreme)', 'CHARACTER', 'Image universe character: Alan Keever (Extreme)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alan-walsh-image', 'Alan Walsh', 'CHARACTER', 'Image universe character: Alan Walsh', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alan-williamson-image', 'Alan Williamson', 'CHARACTER', 'Image universe character: Alan Williamson', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alana-saga-image', 'Alana (Saga)', 'CHARACTER', 'Image universe character: Alana (Saga)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alani-adobo-chew-image', 'Alani Adobo (Chew)', 'CHARACTER', 'Image universe character: Alani Adobo (Chew)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('albert-einstein-the-manhattan-projects-image', 'Albert Einstein (The Manhattan Projects)', 'CHARACTER', 'Image universe character: Albert Einstein (The Manhattan Projects)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('albert-ferrus-wildstorm-universe-image', 'Albert Ferrus (Wildstorm Universe)', 'CHARACTER', 'Image universe character: Albert Ferrus (Wildstorm Universe)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('albert-simmons-image', 'Albert Simmons', 'CHARACTER', 'Image universe character: Albert Simmons', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('albert-simmons-todd-mcfarlanes-spawn-image', 'Albert Simmons (Todd McFarlane''s Spawn)', 'CHARACTER', 'Image universe character: Albert Simmons (Todd McFarlane''s Spawn)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('albrecht-einstein-the-manhattan-projects-image', 'Albrecht Einstein (The Manhattan Projects)', 'CHARACTER', 'Image universe character: Albrecht Einstein (The Manhattan Projects)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('albrecht-regenbogen-chew-image', 'Albrecht Regenbogen (Chew)', 'CHARACTER', 'Image universe character: Albrecht Regenbogen (Chew)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alejandro-rios-wildstorm-universe-image', 'Alejandro Rios (Wildstorm Universe)', 'CHARACTER', 'Image universe character: Alejandro Rios (Wildstorm Universe)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alessandra-fermi-image', 'Alessandra Fermi', 'CHARACTER', 'Image universe character: Alessandra Fermi', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alex-fury-wildstorm-universe-image', 'Alex Fury (Wildstorm Universe)', 'CHARACTER', 'Image universe character: Alex Fury (Wildstorm Universe)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alex-grey-black-magick-image', 'Alex Grey (Black Magick)', 'CHARACTER', 'Image universe character: Alex Grey (Black Magick)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alex-underwood-image', 'Alex Underwood', 'CHARACTER', 'Image universe character: Alex Underwood', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alex-wilde-image', 'Alex Wilde', 'CHARACTER', 'Image universe character: Alex Wilde', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alexander-barros-extreme-image', 'Alexander Barros (Extreme)', 'CHARACTER', 'Image universe character: Alexander Barros (Extreme)', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alexander-fairchild-image', 'Alexander Fairchild', 'CHARACTER', 'Image universe character: Alexander Fairchild', 'READY', 'IMAGE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('asharad-hett-dark-horse', 'A''Sharad Hett', 'CHARACTER', 'Dark_Horse universe character: A''Sharad Hett', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('aayla-secura-dark-horse', 'Aayla Secura', 'CHARACTER', 'Dark_Horse universe character: Aayla Secura', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('abhijat-dark-horse', 'Abhijat', 'CHARACTER', 'Dark_Horse universe character: Abhijat', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('abraham-slamkowski-dark-horse', 'Abraham Slamkowski', 'CHARACTER', 'Dark_Horse universe character: Abraham Slamkowski', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('adi-gallia-dark-horse', 'Adi Gallia', 'CHARACTER', 'Dark_Horse universe character: Adi Gallia', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('agen-kolar-dark-horse', 'Agen Kolar', 'CHARACTER', 'Dark_Horse universe character: Agen Kolar', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('agnes-blones-dark-horse', 'Agnes Blones', 'CHARACTER', 'Dark_Horse universe character: Agnes Blones', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alan-dark-horse', 'Alan', 'CHARACTER', 'Dark_Horse universe character: Alan', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('aldus-hilltop-next-men-dark-horse', 'Aldus Hilltop (Next Men)', 'CHARACTER', 'Dark_Horse universe character: Aldus Hilltop (Next Men)', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alice-monaghan-dark-horse', 'Alice Monaghan', 'CHARACTER', 'Dark_Horse universe character: Alice Monaghan', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alien-queen-dark-horse', 'Alien Queen', 'CHARACTER', 'Dark_Horse universe character: Alien Queen', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('allison-hargreeves-dark-horse', 'Allison Hargreeves', 'CHARACTER', 'Dark_Horse universe character: Allison Hargreeves', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alucard-dark-horse', 'Alucard', 'CHARACTER', 'Dark_Horse universe character: Alucard', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('amanda-watson-dark-horse', 'Amanda Watson', 'CHARACTER', 'Dark_Horse universe character: Amanda Watson', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('amy-madison-dark-horse', 'Amy Madison', 'CHARACTER', 'Dark_Horse universe character: Amy Madison', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('amy-wilding-dark-horse', 'Amy Wilding', 'CHARACTER', 'Dark_Horse universe character: Amy Wilding', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('anya-kuro-dark-horse', 'An''ya Kuro', 'CHARACTER', 'Dark_Horse universe character: An''ya Kuro', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('anakin-skywalker-dark-horse', 'Anakin Skywalker', 'CHARACTER', 'Dark_Horse universe character: Anakin Skywalker', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('annaliese-breznia-dark-horse', 'Annaliese Breznia', 'CHARACTER', 'Dark_Horse universe character: Annaliese Breznia', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('anti-god-dark-horse', 'Anti-God', 'CHARACTER', 'Dark_Horse universe character: Anti-God', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('antonia-murcheson-next-men-dark-horse', 'Antonia Murcheson (Next Men)', 'CHARACTER', 'Dark_Horse universe character: Antonia Murcheson (Next Men)', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('arkoh-adasca-dark-horse', 'Arkoh Adasca', 'CHARACTER', 'Dark_Horse universe character: Arkoh Adasca', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('asaak-dan-dark-horse', 'Asaak Dan', 'CHARACTER', 'Dark_Horse universe character: Asaak Dan', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('asajj-ventress-dark-horse', 'Asajj Ventress', 'CHARACTER', 'Dark_Horse universe character: Asajj Ventress', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('ash-williams-dark-horse', 'Ash Williams', 'CHARACTER', 'Dark_Horse universe character: Ash Williams', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('astaroth-dark-horse', 'Astaroth', 'CHARACTER', 'Dark_Horse universe character: Astaroth', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('aurra-sing-dark-horse', 'Aurra Sing', 'CHARACTER', 'Dark_Horse universe character: Aurra Sing', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('ava-lord-dark-horse', 'Ava Lord', 'CHARACTER', 'Dark_Horse universe character: Ava Lord', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('axey-smartlist-dark-horse', 'Axey Smartlist', 'CHARACTER', 'Dark_Horse universe character: Axey Smartlist', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('baba-yaga-dark-horse', 'Baba Yaga', 'CHARACTER', 'Dark_Horse universe character: Baba Yaga', 'READY', 'DARK_HORSE')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('list-of-characters-spawn', 'List of characters', 'CHARACTER', 'Spawn universe character: List of characters', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('agent-connors-spawn', 'Agent Connors', 'CHARACTER', 'Spawn universe character: Agent Connors', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('agent-roenick-spawn', 'Agent Roenick', 'CHARACTER', 'Spawn universe character: Agent Roenick', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alberto-spawn', 'Alberto', 'CHARACTER', 'Spawn universe character: Alberto', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('amanda-jennings-spawn', 'Amanda Jennings', 'CHARACTER', 'Spawn universe character: Amanda Jennings', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('anahita-spawn', 'Anahita', 'CHARACTER', 'Spawn universe character: Anahita', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('andrei-zlenko-spawn', 'Andrei Zlenko', 'CHARACTER', 'Spawn universe character: Andrei Zlenko', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('andrew-horne-spawn', 'Andrew Horne', 'CHARACTER', 'Spawn universe character: Andrew Horne', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('andy-spawn', 'Andy', 'CHARACTER', 'Spawn universe character: Andy', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('andy-frank-spawn', 'Andy Frank', 'CHARACTER', 'Spawn universe character: Andy Frank', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('angela-spawn', 'Angela', 'CHARACTER', 'Spawn universe character: Angela', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('anne-thomopoulos-spawn', 'Anne Thomopoulos', 'CHARACTER', 'Spawn universe character: Anne Thomopoulos', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('antonio-twistelli-spawn', 'Antonio Twistelli', 'CHARACTER', 'Spawn universe character: Antonio Twistelli', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('avenging-angel-of-the-fifth-heaven-spawn', 'Avenging Angel of the Fifth Heaven', 'CHARACTER', 'Spawn universe character: Avenging Angel of the Fifth Heaven', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('badrock-spawn', 'Badrock', 'CHARACTER', 'Spawn universe character: Badrock', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('beelzebub-spawn', 'Beelzebub', 'CHARACTER', 'Spawn universe character: Beelzebub', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('bernie-spawn', 'Bernie', 'CHARACTER', 'Spawn universe character: Bernie', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('billy-spawn', 'Billy', 'CHARACTER', 'Spawn universe character: Billy', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('billy-kincaid-spawn', 'Billy Kincaid', 'CHARACTER', 'Spawn universe character: Billy Kincaid', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('billy-miller-spawn', 'Billy Miller', 'CHARACTER', 'Spawn universe character: Billy Miller', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('bludd-spawn', 'Bludd', 'CHARACTER', 'Spawn universe character: Bludd', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('bob-spawn', 'Bob', 'CHARACTER', 'Spawn universe character: Bob', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('bob-nyc-police-spawn', 'Bob (NYC Police)', 'CHARACTER', 'Spawn universe character: Bob (NYC Police)', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('bobbie-spawn', 'Bobbie', 'CHARACTER', 'Spawn universe character: Bobbie', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('bobby-spawn', 'Bobby', 'CHARACTER', 'Spawn universe character: Bobby', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('boomer-spawn', 'Boomer', 'CHARACTER', 'Spawn universe character: Boomer', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('boots-spawn', 'Boots', 'CHARACTER', 'Spawn universe character: Boots', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('brad-armstrong-spawn', 'Brad Armstrong', 'CHARACTER', 'Spawn universe character: Brad Armstrong', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('brains-spawn', 'Brains', 'CHARACTER', 'Spawn universe character: Brains', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('brimstone-spawn', 'Brimstone', 'CHARACTER', 'Spawn universe character: Brimstone', 'READY', 'SPAWN')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('angel-scream-transformers', '"Angel" Scream', 'CHARACTER', 'Transformers universe character: "Angel" Scream', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('abominus-rid-transformers', 'Abominus (RID)', 'CHARACTER', 'Transformers universe character: Abominus (RID)', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('abominus-tfp-transformers', 'Abominus TFP', 'CHARACTER', 'Transformers universe character: Abominus TFP', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('abraham-lincoln-tfp-transformers', 'Abraham Lincoln TFP', 'CHARACTER', 'Transformers universe character: Abraham Lincoln TFP', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('acid-storm-cyberverse-transformers', 'Acid Storm (Cyberverse)', 'CHARACTER', 'Transformers universe character: Acid Storm (Cyberverse)', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('ada-lovelace-transformers', 'Ada Lovelace', 'CHARACTER', 'Transformers universe character: Ada Lovelace', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('aegis-vanguard-transformers', 'Aegis Vanguard', 'CHARACTER', 'Transformers universe character: Aegis Vanguard', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('aerialbots-tfp-transformers', 'Aerialbots TFP', 'CHARACTER', 'Transformers universe character: Aerialbots TFP', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('aerobolt-transformers', 'Aerobolt', 'CHARACTER', 'Transformers universe character: Aerobolt', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('afterburner-cyberverse-transformers', 'Afterburner (Cyberverse)', 'CHARACTER', 'Transformers universe character: Afterburner (Cyberverse)', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('afterburner-tfp-transformers', 'Afterburner TFP', 'CHARACTER', 'Transformers universe character: Afterburner TFP', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('agent-schloder-earthspark-transformers', 'Agent Schloder (EarthSpark)', 'CHARACTER', 'Transformers universe character: Agent Schloder (EarthSpark)', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('aimless-tfp-transformers', 'Aimless TFP', 'CHARACTER', 'Transformers universe character: Aimless TFP', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('air-raid-tfp-transformers', 'Air Raid TFP', 'CHARACTER', 'Transformers universe character: Air Raid TFP', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('airachnid-one-transformers', 'Airachnid (One)', 'CHARACTER', 'Transformers universe character: Airachnid (One)', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('airachnid-tfp-transformers', 'Airachnid TFP', 'CHARACTER', 'Transformers universe character: Airachnid TFP', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('airazor-prime-transformers', 'Airazor (Prime)', 'CHARACTER', 'Transformers universe character: Airazor (Prime)', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('airazor-rotb-transformers', 'Airazor (ROTB)', 'CHARACTER', 'Transformers universe character: Airazor (ROTB)', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('airazor-tfp-transformers', 'Airazor TFP', 'CHARACTER', 'Transformers universe character: Airazor TFP', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('airwave-tfp-transformers', 'Airwave TFP', 'CHARACTER', 'Transformers universe character: Airwave TFP', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('akiba-prime-transformers', 'Akiba Prime', 'CHARACTER', 'Transformers universe character: Akiba Prime', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('al-transformers', 'Al', 'CHARACTER', 'Transformers universe character: Al', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alchemist-prime-transformers', 'Alchemist Prime', 'CHARACTER', 'Transformers universe character: Alchemist Prime', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alchemist-prime-one-transformers', 'Alchemist Prime (One)', 'CHARACTER', 'Transformers universe character: Alchemist Prime (One)', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alex-malto-earthspark-transformers', 'Alex Malto (EarthSpark)', 'CHARACTER', 'Transformers universe character: Alex Malto (EarthSpark)', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alexis-dreamwave-transformers', 'Alexis (Dreamwave)', 'CHARACTER', 'Transformers universe character: Alexis (Dreamwave)', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alpha-trion-cyberverse-transformers', 'Alpha Trion (Cyberverse)', 'CHARACTER', 'Transformers universe character: Alpha Trion (Cyberverse)', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alpha-trion-one-transformers', 'Alpha Trion (One)', 'CHARACTER', 'Transformers universe character: Alpha Trion (One)', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alpha-trion-wfc-trilogy-transformers', 'Alpha Trion (WFC Trilogy)', 'CHARACTER', 'Transformers universe character: Alpha Trion (WFC Trilogy)', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

INSERT INTO public.ppcf_wiki_pages (slug, display_title, page_type, summary, page_status, universe)
VALUES ('alpha-trion-tfp-transformers', 'Alpha Trion TFP', 'CHARACTER', 'Transformers universe character: Alpha Trion TFP', 'READY', 'TRANSFORMERS')
ON CONFLICT (slug) DO UPDATE SET display_title = EXCLUDED.display_title, summary = EXCLUDED.summary, universe = EXCLUDED.universe;

