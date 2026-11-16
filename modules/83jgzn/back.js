/* hizmet-bolum-suz — Hizmet Bölüm Süzgeci — bölüm çipleri ve aramayla süzülen hizmet kartları (16 Kas 2026 · mcp:webmaker/20261116-113510-tlwf · D17).
   Yapışkan süzgeç çubuğu: bölüm çipleri (Tümü + her bölüm, hizmet sayısıyla) ve isteğe bağlı arama kutusu; altında köşesinde bölüm etiketi olan kompakt hizmet kartları (ikon, ad, açıklama, maddeler, fiyat, bağlantı). Seçim/arama kartları anında süzer, sonuç yoksa «sonuç bulunamadı». JS yoksa tüm hizmetler görünür.
   Üretici: scripts/modul-fabrika (aile hizmet) — elle düzenleme yerine tanımı değiştirip yeniden üret.
   Veri: data: [{ baslik (eski `ad`), metin (eski `ozet`), maddeler[]?, ikon?, img?, alt?, fiyat?, url?, linkMetin? }] — metinler dil sözlüğü; adsız hizmet atlanır. */
const P = "modulex-hizmet-bolum-suz";
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
/* --- aile: hizmet --- */
const kaynak = veri.length ? veri : (json.data && Array.isArray(json.data.hizmetler) ? json.data.hizmetler : (Array.isArray(des.hizmetler) ? des.hizmetler : []));
const linkGenel = metinAl(des, ["linkMetin", "ctaLabel"]);
const maddeAl = (x) => (x && typeof x === "object" && !Array.isArray(x) && ilk(x, ["metin", "baslik", "text"]) ? metinAl(x, ["metin", "baslik", "text"]) : pick(x).trim());
const kayitlar = kaynak.map((o) => {
  const m = ilk(o, ["maddeler", "ozellikler", "items", "liste"]);
  return {
    baslik: metinAl(o, ["baslik", "ad", "title", "name"]), metin: metinAl(o, ["metin", "ozet", "description", "aciklama", "text"]),
    ikon: ikonAd(ilk(o, ["ikon", "icon"])), img: medyaUrl(ilk(o, ["img", "image", "gorsel"])), alt: metinAl(o, ["alt", "imgAlt"]),
    url: href(ilk(o, ["url", "link"])), link: metinAl(o, ["linkMetin", "ctaLabel"]) || linkGenel, fiyat: metinAl(o, ["fiyat", "price"]),
    maddeler: (Array.isArray(m) ? m : []).map(maddeAl).filter(Boolean),
  };
}).filter((k) => k.baslik);
const bH = (k, s, t) => `<${t || "h3"} class="${P}-${s || "kbaslik"}">${esc(k.baslik)}</${t || "h3"}>`;
const mH = (k, s) => (k.metin ? `<p class="${P}-${s || "kmetin"}">${satirlar(k.metin)}</p>` : "");
const gH = (k, s) => (k.img ? `<img class="${P}-${s || "gorsel"}" src="${esc(k.img)}" alt="${esc(k.alt)}" width="800" height="600" loading="lazy" decoding="async" />` : "");
const fH = (k) => (k.fiyat ? `<p class="${P}-fiyat">${esc(k.fiyat)}</p>` : "");
const dH = (k, s) => (k.maddeler.length ? `<ul class="${P}-${s || "maddeler"}">${k.maddeler.map((x) => `<li><span class="material-symbols-outlined" aria-hidden="true">check</span><span>${esc(x)}</span></li>`).join("")}</ul>` : "");
const lH = (k, s) => (k.url ? `<a class="${P}-${s || "git"}" href="${esc(k.url)}">${k.link ? esc(k.link) : "@read-more@"}<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></a>` : "");
/* --- modül: hizmet-bolum-suz --- */
const kart = (k, i, n, A) => {
    const j = A ? A.indexOf(k) : i;
    const o = kaynak.filter((x) => metinAl(x, ["baslik", "ad", "title", "name"]))[j] || {};
    const b = metinAl(o, ["bolum", "kategori", "brans", "department"]);
    const key = b ? b.toLocaleLowerCase(dil || undefined) : "";
    return `<li class="${P}-kart" data-bolum="${esc(key)}"${b ? ` data-bolum-ad="${esc(b)}"` : ""}><div class="${P}-tepe">${b ? `<span class="${P}-serit">${esc(b)}</span>` : ""}${ikonH(k.ikon || "medical_services", `${P}-ikon`)}</div>${bH(k)}${mH(k)}${dH(k)}${k.fiyat || k.url ? `<div class="${P}-alt">${fH(k)}${lH(k)}</div>` : ""}</li>`;
  };
const sar = (ic, A) => {
    const B2 = new Map();
    [...ic.matchAll(/data-bolum="([^"]*)" data-bolum-ad="([^"]*)"/g)].forEach((m) => { if (!B2.has(m[1])) B2.set(m[1], { ad: m[2], n: 0 }); B2.get(m[1]).n++; });
    const ara = metinAl(des, ["aramaEtiket"]);
    const cip = (v, ad, sayi, on) => `<button type="button" class="${P}-cip" data-bsuz="${v}" aria-pressed="${on}">${ad}<span class="${P}-csay">${sayiBicim(sayi, 0)}</span></button>`;
    const cipler = B2.size > 1 ? `<div class="${P}-cipler">${cip("", "@all@", A.length, true)}${[...B2].map(([v, x]) => cip(v, x.ad, x.n, false)).join("")}</div>` : "";
    const kutu = ara ? `<label class="${P}-ara"><span class="material-symbols-outlined" aria-hidden="true">search</span><input type="search" data-bara placeholder="${esc(ara)}" aria-label="${esc(ara)}" autocomplete="off" /></label>` : "";
    return `${cipler || kutu ? `<div class="${P}-cubuk">${cipler}${kutu}</div>` : ""}<ul class="${P}-izgara">${ic}</ul><p class="${P}-bos" data-bbos hidden><span class="material-symbols-outlined" aria-hidden="true">search_off</span>@no-results@</p>`;
  };
const B = { ust: metinAl(des, ["ust","eyebrow","badge","kicker"]), baslik: metinAl(des, ["baslik","title"]), metin: metinAl(des, ["metin","description","aciklama"]) };
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
