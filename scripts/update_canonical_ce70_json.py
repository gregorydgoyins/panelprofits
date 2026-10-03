import sqlite3
import json
import re

def main():
    conn = sqlite3.connect("../shadow_database.sqlite")
    cur = conn.cursor()

    query = """
    SELECT c.seat_number, c.title, c.issue_number, c.canonical_issue_id, c.lineage,
           c.reference_grade, c.reference_fmv_usd, c.gregory_score, c.origin_era, c.production_age
    FROM ce70_constituents_final c
    WHERE c.scenario = "CE70-8.5"
    ORDER BY c.seat_number
    """
    rows = cur.execute(query).fetchall()

    creators_map = {
        1: "Otto Binder, Al Plastino, Curt Swan",
        2: "Dennis O'Neil, Neal Adams",
        3: "Robert Kanigher, Ross Andru, Mike Esposito",
        4: "Otto Binder, C.C. Beck",
        5: "Harvey Kurtzman, Jack Davis, Wally Wood, Bill Elder",
        6: "Al Feldstein, Johnny Craig",
        7: "Joe Simon, Jack Kirby",
        8: "Al Feldstein, Johnny Craig, Jack Davis",
        9: "Stan Lee, Larry Lieber, Jack Kirby",
        10: "Stan Lee, Steve Ditko",
        11: "Stan Lee, Jack Kirby, Joe Sinnott",
        12: "Stan Lee, Steve Ditko",
        13: "Stan Lee, Jack Kirby, Paul Reinman",
        14: "Stan Lee, Jack Kirby, George Roussos",
        15: "Frank Miller, Klaus Janson",
        16: "Dennis O'Neil, Neal Adams",
        17: "Stan Lee, John Buscema, Joe Sinnott",
        18: "Len Wein, Dave Cockrum",
        19: "Alan Moore, Stephen R. Bissette, John Totleben",
        20: "Jack Kirby, Vince Colletta",
        21: "Roy Thomas, Barry Windsor-Smith",
        22: "Marv Wolfman, Gene Colan, Jack Abel",
        23: "Dave Sim",
        24: "Gilbert Hernandez, Jaime Hernandez",
        25: "Alan Moore, Dave Gibbons, John Higgins",
        26: "Frank Miller, Klaus Janson, Lynn Varley",
        27: "Kevin Eastman, Peter Laird",
        28: "Neil Gaiman, Mike Dringenberg, Malcolm Jones III",
        29: "Jeff Smith",
        30: "Jim Starlin, George Pérez, Ron Lim",
        31: "Marv Wolfman, George Pérez, Dick Giordano",
        32: "Robert Kirkman, Tony Moore",
        33: "Todd McFarlane",
        34: "Mark Waid, Alex Ross",
        35: "Brian Michael Bendis, Mark Bagley, Art Thibert",
        36: "Garth Ennis, Steve Dillon",
        37: "Brian K. Vaughan, Pia Guerra, José Marzán Jr.",
        38: "Robert Kirkman, Cory Walker, Bill Crabtree",
        39: "Grant Morrison, Frank Quitely, Jamie Grant",
        40: "Brian K. Vaughan, Fiona Staples",
        41: "Bryan Lee O'Malley",
        42: "Matt Fraction, David Aja, Matt Hollingsworth",
        43: "Marjorie Liu, Sana Takeda",
        44: "G. Willow Wilson, Adrian Alphona, Ian Herring",
        45: "Scott Snyder, Greg Capullo, Jonathan Glapion",
        46: "Tom King, Mitch Gerads",
        47: "Jonathan Hickman, Pepe Larraz, Marte Gracia",
        48: "Al Ewing, Joe Bennett, Ruy José",
        49: "James Tynion IV, Werther Dell'Edera, Miquel Muerto",
        50: "James Tynion IV, Álvaro Martínez Bueno, Jordie Bellaire",
        51: "Tom Taylor, Bruno Redondo, Adriano Lucas",
        52: "Jonathan Hickman, Marco Checchetto, Matthew Wilson",
        64: "Hergé",
        65: "René Goscinny, Albert Uderzo",
        66: "Alejandro Jodorowsky, Moebius",
        67: "Katsuhiro Otomo",
        68: "Eiichiro Oda",
        69: "Tsugumi Ohba, Takeshi Obata",
        70: "Tatsuki Fujimoto"
    }

    def parse_cid(cid):
        m = re.search(r"_pub_([a-z]+)_(.+)_(\d{4})_v\d+_", cid)
        if m:
            pub_raw, series_slug, year = m.group(1), m.group(2), int(m.group(3))
            pub_map = {
                "dc": "DC Comics",
                "marvel": "Marvel Comics",
                "image": "Image Comics",
                "ec": "EC Comics",
                "fawcett": "Fawcett Publications",
                "prize": "Prize Comics",
                "mirage": "Mirage Studios",
                "boom": "BOOM! Studios",
                "idw": "IDW Publishing",
                "darkhorse": "Dark Horse",
                "fantagraphics": "Fantagraphics",
                "casterman": "Casterman",
                "dargaud": "Dargaud",
                "humanoïdes": "Les Humanoïdes Associés",
                "kodansha": "Kodansha",
                "shueisha": "Shueisha",
                "oni": "Oni Press"
            }
            return pub_map.get(pub_raw, pub_raw.capitalize()), year
        return "Independent", 1970

    ref_fmv = {}
    dossiers = []

    grade_factors = {
        "RAW": 0.08,
        "4.0": 0.22,
        "6.0": 0.40,
        "8.0": 0.72,
        "9.0": 1.00,
        "9.2": 1.25,
        "9.4": 1.65,
        "9.6": 2.30,
        "9.8": 3.80,
    }

    for r in rows:
        sn, title, iss, cid, lin, rg, rfmv, gs, oera, pera = r
        pub, year = parse_cid(cid)
        creators = creators_map.get(sn, "Canonical Creator Team")
        grade_str = f"{rg:.1f}" if isinstance(rg, float) else str(rg)
        
        scale = rfmv / (grade_factors.get("8.0", 0.72) * 1.15 if grade_str == "8.5" else (grade_factors.get(grade_str, 1.0)))
        
        book_title = f"{title} #{iss}"
        cover_price = 0.10 if year < 1962 else (0.12 if year < 1969 else (0.20 if year < 1975 else (0.25 if year < 1977 else (0.35 if year < 1980 else (0.60 if year < 1986 else (1.00 if year < 1990 else 2.99))))))
        
        item = {
            "seatNumber": sn,
            "series": title,
            "issueNumber": str(iss),
            "title": book_title,
            "publisher": pub,
            "year": year,
            "creators": creators,
            "canonicalId": cid,
            "lineage": lin,
            "coverPrice": cover_price,
            "rawFmvUsd": round(scale * grade_factors["RAW"], 2),
            "grade40FmvUsd": round(scale * grade_factors["4.0"], 2),
            "grade60FmvUsd": round(scale * grade_factors["6.0"], 2),
            "grade80FmvUsd": round(scale * grade_factors["8.0"], 2),
            "grade90FmvUsd": round(scale * grade_factors["9.0"], 2) if grade_str != "9.0" else rfmv,
            "grade92FmvUsd": round(scale * grade_factors["9.2"], 2),
            "grade94FmvUsd": round(scale * grade_factors["9.4"], 2),
            "grade96FmvUsd": round(scale * grade_factors["9.6"], 2),
            "grade98FmvUsd": round(scale * grade_factors["9.8"], 2),
            "referenceGrade": grade_str,
            "referenceFmvUsd": rfmv,
            "gregoryScore": gs,
            "originEra": oera,
            "productionAge": pera
        }
        
        # Keys
        ref_fmv[str(sn)] = item
        ref_fmv[book_title] = item
        ref_fmv[cid] = item
        ref_fmv[f"{title} {iss}"] = item
        if title.startswith("The "):
            ref_fmv[f"{title[4:]} #{iss}"] = item
            ref_fmv[f"{title[4:]} {iss}"] = item
        else:
            ref_fmv[f"The {title} #{iss}"] = item
            ref_fmv[f"The {title} {iss}"] = item

        dossiers.append({
            "seatNumber": sn,
            "title": book_title,
            "year": year,
            "canonicalId": cid,
            "era": oera.upper() + " AGE",
            "publisher": pub,
            "creators": creators,
            "status": "ACTIVE",
            "gregoryScore": gs,
            "qualityScores": {
                "historicalSignificance": round(gs * 0.5, 1),
                "creativePedigree": round(gs * 0.3, 1),
                "marketLiquidity": round(gs * 0.2, 1)
            },
            "justification": f"Canonical constituent of the Panel Profits CE70 Sovereign Comic Equities Index. Anchored at reference grade {grade_str} with authoritative valuation of ${rfmv:,.2f}.",
            "essay": f"{book_title} ({year}, {pub}) by {creators} represents an irreplaceable sovereign asset in the {lin}. Evaluated under strict zero-variance domain rules at Grade {grade_str} baseline."
        })

    print(f"Generated ref_fmv with {len(ref_fmv)} keys and {len(dossiers)} dossiers.")
    with open("lib/equity/ce70-reference-fmv.json", "w") as f:
        json.dump(ref_fmv, f, indent=2)

    with open("lib/equity/ce70-dossiers-data.json", "w") as f:
        json.dump(dossiers, f, indent=2)

    print("SUCCESS: Updated ce70-reference-fmv.json and ce70-dossiers-data.json!")

if __name__ == "__main__":
    main()
