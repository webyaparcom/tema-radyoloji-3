/* zaman-cift-kulvar — Zaman Çift Kulvar — iki paralel şeritte aynı yıla hizalanan olaylar (16 Kas 2026 · mcp:webmaker/20261116-181132-t332 · D17).
   İki adlandırılmış kulvar (ör. «Şirketimiz» · «Sektörde», «Anne» · «Bebek») ve ortada yıl ekseni: aynı yıla düşen olaylar aynı satırda iki yana hizalanır, kulvarı boş kalan yılda kesik nokta izi kalır; kulvar başlıkları kaydırırken yapışkan, kartlar eksene kesik çizgiyle bağlanır. Mobilde tek sütun, her kartta kulvar çipi. Veride `kol` (1/2) yoksa olaylar sırayla iki kulvara dağılır.
   Üretici: scripts/modul-fabrika (aile timeline) — elle düzenleme yerine tanımı değiştirip yeniden üret.
   Veri: data: [{ etiket (yıl/tarih), baslik, metin?, ikon?, img?, url? }] — metinler dil sözlüğü; başlıksız satır atlanır. */
const P = "modulex-zaman-cift-kulvar";
const IMG_KOK = "/img/";
/* --- ortak ön ek (scripts/modul-fabrika/on-ek.js) — dil · güvenlik · sayı yardımcıları --- */
const pick = (v) => {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  if (typeof wmPickLang === "function") { try { return wmPickLang(v, json.lang) || ""; } catch (e) { /* alt satır */ } }
  return String(v[json.lang] ?? Object.values(v)[0] ?? "");
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const medyaUrl = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|file):/i.test(s)) return "";
  if (/^data:/i.test(s)) return /^data:(image|video|audio)\//i.test(s) ? s : "";
  if (s.startsWith("/") || /^https?:\/\//i.test(s)) return s;
  return `${IMG_KOK}${s}`;
};
const href = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|data):/i.test(s)) return "";
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s)) return s;
  return wxLangInternalHref(s);
};
const dogru = (v, d) => (v === undefined || v === null || v === "") ? d : !(v === false || v === "false" || v === 0 || v === "0");
const ikonAd = (v) => String(v ?? "").trim().replace(/[^a-z0-9_]/gi, "");
const satirlar = (s) => esc(s).replace(/\r?\n/g, "<br />");
/* ilk dolu alan: yeni ad önce, eski kuşak şablonun adı yedek (G6 yalnız path değiştirerek takas eder) */
const ilk = (o, ks) => {
  for (const k of ks) {
    const v = o == null ? undefined : o[k];
    if (v == null || v === "") continue;
    if (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length) continue;
    return v;
  }
  return "";
};
const metinAl = (o, ks) => pick(ilk(o, ks)).trim();
const { desing: des = {} } = json;
const setting = webmakerdata?.setting ?? {};
const veri = Array.isArray(json.data) ? json.data : [];
const dil = String(json.lang || "");
const sayiBicim = (v, ondalik) => {
  try { return new Intl.NumberFormat(dil || undefined, { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik }).format(v); } catch (e) { return String(v); }
};
const ikonH = (ad, sinif) => (ad ? `<span class="${sinif} material-symbols-outlined" aria-hidden="true">${ad}</span>` : "");
const no = (i) => String(i + 1).padStart(2, "0");
const ctaHtml = () => {
  const a1 = metinAl(des, ["cta_ad", "button"]); const u1 = href(ilk(des, ["cta_url", "buttonurl", "url"]));
  const a2 = metinAl(des, ["cta2_ad"]); const u2 = href(ilk(des, ["cta2_url"]));
  const d = (a, u, ek) => (a && u ? `<a class="${P}-dugme${ek}" href="${esc(u)}">${esc(a)}<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></a>` : "");
  const ic = d(a1, u1, "") + d(a2, u2, ` ${P}-dugme--ikincil`);
  return ic ? `<div class="${P}-cta">${ic}</div>` : "";
};
const basHtml = (B, ek) => {
  if (!B.ust && !B.baslik && !B.metin && !ek) return "";
  return `<header class="${P}-bas">`
    + (B.ust ? `<p class="${P}-ust">${esc(B.ust)}</p>` : "")
    + (B.baslik ? `<h2 class="${P}-baslik" id="${P}-{{id}}-b">${esc(B.baslik)}</h2>` : "")
    + (B.metin ? `<p class="${P}-metin">${satirlar(B.metin)}</p>` : "")
    + (ek || "")
    + "</header>";
};
/* --- aile: timeline --- */
const kayitlar = veri.map((o) => ({
  etiket: metinAl(o, ["etiket", "year", "yil", "tarih", "date"]), baslik: metinAl(o, ["baslik", "title", "name"]),
  metin: metinAl(o, ["metin", "text", "description", "aciklama"]), ikon: ikonAd(ilk(o, ["ikon", "icon"])),
  img: medyaUrl(ilk(o, ["img", "image"])), url: href(ilk(o, ["url", "link"])),
})).filter((k) => k.baslik);
const bH = (k, s, t) => `<${t || "h3"} class="${P}-${s || "kbaslik"}">${k.url ? `<a class="${P}-bag" href="${esc(k.url)}">${esc(k.baslik)}</a>` : esc(k.baslik)}</${t || "h3"}>`;
const mH = (k, s) => (k.metin ? `<p class="${P}-${s || "kmetin"}">${satirlar(k.metin)}</p>` : "");
const yH = (k, s) => (k.etiket ? `<p class="${P}-${s || "yil"}">${esc(k.etiket)}</p>` : "");
const gH = (k, s) => (k.img ? `<img class="${P}-${s || "gorsel"}" src="${esc(k.img)}" alt="" width="800" height="560" loading="lazy" decoding="async" />` : "");
/* --- modül: zaman-cift-kulvar --- */
const kart = () => "";
const sar = (ic, A) => {
    const R = veri.filter((o) => metinAl(o, ["baslik", "title", "name"]));
    const ham = A.map((k, i) => String(ilk(R[i] || {}, ["kol", "lane", "taraf"]) || "").trim().toLowerCase());
    const varMi = ham.some(Boolean);
    const kol = (i) => (varMi ? (/^(2|b|sag|right|ikinci)$/.test(ham[i]) ? 2 : 1) : (i % 2) + 1);
    const ad = [metinAl(des, ["kol1"]), metinAl(des, ["kol2"])];
    const G = [];
    A.forEach((k, i) => { const e = k.etiket || ""; let g = e ? G.find((x) => x.e === e) : null; if (!g) { g = { e, h: [[], []] }; G.push(g); } g.h[kol(i) - 1].push(k); });
    const olay = (k, c) => `<article class="${P}-olay ${P}-olay--${c}">${ad[c - 1] ? `<span class="${P}-kcip">${esc(ad[c - 1])}</span>` : ""}${ikonH(k.ikon, `${P}-ikon`)}${bH(k)}${mH(k)}</article>`;
    const hucre = (g, c) => `<div class="${P}-hucre ${P}-hucre--${c}">${g.h[c - 1].length ? g.h[c - 1].map((k) => olay(k, c)).join("") : `<span class="${P}-bos" aria-hidden="true"></span>`}</div>`;
    const kulvar = ad[0] || ad[1] ? `<div class="${P}-kulvarlar" aria-hidden="true"><p class="${P}-kad ${P}-kad--1">${esc(ad[0])}</p><p class="${P}-kad ${P}-kad--2">${esc(ad[1])}</p></div>` : "";
    return `${kulvar}<ol class="${P}-satirlar">${G.map((g) => `<li class="${P}-satir">${g.e ? `<p class="${P}-yil"><bdi dir="ltr">${esc(g.e)}</bdi></p>` : ""}${hucre(g, 1)}${hucre(g, 2)}</li>`).join("")}</ol>`;
  };
const B = { ust: metinAl(des, ["ust","badge","kicker"]), baslik: metinAl(des, ["baslik","title"]), metin: metinAl(des, ["metin","description"]) };
/* veri yoksa gövde hiç kurulmaz (sarmalayıcı boş listeye dokunmaz) */
const BOS = !kayitlar.length;
const govde = BOS ? "" : sar(kayitlar.map((k, i) => kart(k, i, kayitlar.length, kayitlar)).join(""), kayitlar, B);
const bas = basHtml(B, "");
const sinif = (bas || B.ust || B.baslik || B.metin ? "" : ` ${P}--bassiz`);
html = html
  .replaceAll("{{fbsinif}}", () => sinif)
  .replaceAll("{{fbetiket}}", () => (B.baslik ? `aria-labelledby="${P}-{{id}}-b"` : ""))
  .replaceAll("{{fbbas}}", () => bas)
  .replaceAll("{{fbgovde}}", () => govde);
if (BOS) html = "";
