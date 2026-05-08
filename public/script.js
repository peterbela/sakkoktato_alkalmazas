// @ts-nocheck

// Backend kapcsolat tesztelése
document.getElementById("checkServer").addEventListener("click", async () => {
  try {
    const res = await fetch("/");
    const text = await res.text();
    document.getElementById("response").textContent =
      "✅ Backend válasza: " + text;
  } catch (err) {
    document.getElementById("response").textContent =
      "❌ Nem sikerült kapcsolódni a szerverhez.";
  }
});

const LESSONS = [
  {
    id: "intro",
    title: "Bevezetés: Mi az a sakk?",
    body: `
A sakk egy kétjátékos stratégiai táblajáték. A célod, hogy sakkmattot adj az ellenfél királyának, vagyis olyan helyzetbe hozd, ahol a királyt támadás éri, és nincs szabályos lépés, amivel ki tudna menekülni.

Mindig a világos (fehér) kezd, és a játékosok felváltva lépnek.
    `,
  },
  {
    id: "board",
    title: "A sakktábla felépítése",
    body: `
A sakktábla 8×8-as mezőből áll, világos és sötét négyzetek váltják egymást.

Az oszlopokat betűk jelölik: a, b, c, d, e, f, g, h.  
A sorokat számok jelölik: 1–8-ig.

Egy mezőt egy betű–szám páros ír le, például:  
- "e4": az e oszlop és a 4. sor metszéspontja  
- "a1": bal alsó sarok világos mező.
    `,
  },
  {
    id: "pawn",
    title: "A gyalog lépései",
    body: `
A gyalog a legegyszerűbb, mégis nagyon fontos bábu.

- Egy mezőt lép előre.  
- Az első lépésénél dönthetsz úgy, hogy két mezőt lép előre.  
- Ütni átlósan előre tud: balra-előre vagy jobbra-előre.  
- Soha nem léphet hátra.

A táblán most egy fehér gyalogot látsz az e2 mezőn, előtte és átlósan körülötte néhány bábut. Próbáld ki, milyen lépések engedélyezettek!
    `,
  },
  {
    id: "rook",
    title: "A bástya lépései",
    body: `
A bástya nagyon erős figura, mert hosszú távon mozog:

- Egyenesen léphet: vízszintesen vagy függőlegesen.  
- Annyi mezőt mehet, ameddig útjába nem kerül valami.  
- Nem ugorhat át más bábukat.  
- Ellenfelet úgy üt, hogy rálép a mezőjére.

A bástyák különösen erősek a nyílt oszlopokon.
    `,
  },
  {
    id: "bishop",
    title: "A futó lépései",
    body: `
A futó átlós vonalakon mozog:

- Bármennyi mezőt léphet átlósan.  
- Nem ugorhat át más bábukat.  
- Mindig azon a színű mezőkön marad, amin kezdte (világos vagy sötét).

A két futó együtt hatalmas területeket képes uralni.
    `,
  },
  {
    id: "knight",
    title: "A huszár lépései",
    body: `
A huszár különleges, mert egyedül ő tud átugrani más bábukat.

A huszár L-alakban lép:
- két mezőt egy irányba, majd egy mezőt merőlegesen,  
- vagy fordítva.

Így olyan mezőkre is eljut, ahova más bábu nem.
    `,
  },
  {
    id: "queen",
    title: "A vezér lépései",
    body: `
A vezér a legerősebb bábu a táblán:

- úgy léphet, mint a bástya (egyenesen),  
- és úgy is, mint a futó (átlósan).  

Bármennyi mezőt mehet, amíg nem ütközik akadályba.
    `,
  },
  {
    id: "king",
    title: "A király lépései",
    body: `
A király egy mezőt léphet minden irányba:

- előre, hátra, oldalra, átlósan.

A király nem léphet olyan mezőre, amit az ellenfél támad, ezt hívjuk sakk helyzetnek (sakknak).

A király védelme a legfontosabb, hiszen ha sakkmatt fenyegeti, vége a játéknak.
    `,
  },
  {
    id: "rules",
    title: "Alapszabályok: sakk, sakkmatt, patt",
    body: `
Sakk: a királyt támadás éri.

Sakkmatt: a király sakkban áll, és egyetlen lépéssel sem menekülhet. Ez vereséget jelent.

Patt: a játékos nem tud szabályosan lépni, de nincs sakkban -> döntetlen.

Döntetlen még akkor is lehet, ha:
- többször ugyanaz az állás jön létre (háromszori ismétlés),
- egyik fél sem rendelkezik elég figurával a mattadásra.
    `,
  },
];

// Leckénként hány feladat van (most mindegyiknél 1, később bővíthető)
const LESSON_TASK_TOTALS = {
  intro: 1,
  board: 1,
  pawn: 1,
  rook: 1,
  bishop: 1,
  knight: 1,
  queen: 1,
  king: 1,
  rules: 1,
};


// Felváltva lépnek a világos és sötét bábuk
function getTurnLabel() {
  return currentTurn === "white" ? "Világos" : "Sötét";
}

function updateTurnUi() {
  const turnText = document.getElementById("turnText");
  if (turnText) {
    turnText.textContent = `${getTurnLabel()} következik.`;
  }
}

function switchTurn() {
  currentTurn = currentTurn === "white" ? "black" : "white";
  updateTurnUi();
}

// gomb eseménykezelő
document
  .getElementById("randomPieceBtn")
  .addEventListener("click", placeRandomPosition);
document
  .getElementById("startPositionBtn")
  .addEventListener("click", setStartingPosition);

// induláskor sakktábla kirajzolása + leckék és haladás betöltése
generateChessboard();
setupLessonNav();
setupUserPanel();
updateUserUi();
initProgress();