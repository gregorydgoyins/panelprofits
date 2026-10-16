/** Stable navigation categories over the original imported wiki records. */
export const wikiCategories = {
  characters: {title:'Characters',column:'page_type',values:['CHARACTER','character']},
  teams: {title:'Teams',column:'page_type',values:['TEAM','team']},
  locations: {title:'Locations',column:'page_type',values:['LOCATION','location']},
  items: {title:'Items and vehicles',column:'page_type',values:['ITEM','VEHICLE','item','vehicle']},
  marvel: {title:'Marvel',column:'universe',values:['MARVEL']},
  dc: {title:'DC',column:'universe',values:['DC']},
  'star-wars': {title:'Star Wars',column:'universe',values:['STAR_WARS','STARWARS']},
  image: {title:'Image',column:'universe',values:['IMAGE','IMAGECOMICS']},
  'dark-horse': {title:'Dark Horse',column:'universe',values:['DARK_HORSE','DARKHORSE']},
  spawn: {title:'Spawn',column:'universe',values:['SPAWN']},
  transformers: {title:'Transformers',column:'universe',values:['TRANSFORMERS']},
} as const;
