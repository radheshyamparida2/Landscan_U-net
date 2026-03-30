/* ============================================================
   LandScan AI — script.js  (integrated edition)
   All data from CSV tables, Chart.js setup, and interactivity.
   ============================================================ */
'use strict';

/* ─────────────────────────────────────
   0. Topographic background canvas
───────────────────────────────────── */
(function initTopo() {
  const canvas = document.getElementById('topo-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, lines = [];
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildLines();
  }
  function buildLines() {
    lines = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      const pts = [];
      const y0  = (H / count) * i + H / (count * 2);
      for (let x = 0; x <= W; x += 40)
        pts.push({ x, y: y0 + (Math.random() - .5) * 60 });
      lines.push(pts);
    }
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(0,212,255,0.6)';
    ctx.lineWidth   = 1;
    lines.forEach(pts => {
      ctx.beginPath();
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });
  }
  window.addEventListener('resize', resize);
  resize(); draw();
})();

/* ─────────────────────────────────────
   1. Chart.js shared defaults
───────────────────────────────────── */
const TICK = '#3d6478';
const GRID = 'rgba(0,212,255,0.07)';
const CD = {
  responsive: true,
  animation:  { duration: 600 },
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#0a1520', borderColor: 'rgba(0,212,255,.3)', borderWidth: 1 },
  },
};

/* ─────────────────────────────────────
   2. Model colour palette
───────────────────────────────────── */
const COLS = {
  unet:        '#00d4ff',
  attnunet:    '#39ff7e',
  resunet:     '#ff6b35',
  attnresunet: '#ffb800',
  mmarunet:    '#c084fc',
};

/* ─────────────────────────────────────
   3. T1 — model_metrics_full (from CSV)
───────────────────────────────────── */
const EVAL = [
  { key:'attnresunet', model:'Attn-ResUNet', icon:'AR', color:'#ffb800', bg:'rgba(255,184,0,.15)',
    iou:0.2333, f1:0.3784, prec:0.4118, rec:0.35, specificity:0.9967,
    boundary_f1:0.5219, ap:0.434, roc_auc:0.9818, kappa:0.3746, mcc:0.3759,
    tp:28, fp:40, fn:52, tn:12168, avg_conf:0.1931, max_conf:0.7838,
    mean_iou_patch:0.4935, std_iou_patch:0.3964,
    params:'38.5M', depth:4, pretrain:'HR-GLDD', channels:17,
    samples: [
      { s:'Patch 0', iou:0.4483, f1:0.619,  prec:0.65,   rec:0.5909, bF1:0.5,    ap:0.7596, tp:26, fp:14, fn:18, tn:4038 },
      { s:'Patch 1', iou:0.0323, f1:0.0625, prec:0.0714, rec:0.0556, bF1:0.0656, ap:0.0743, tp:2,  fp:26, fn:34, tn:4034 },
      { s:'Patch 2', iou:1.0,    f1:0.0,    prec:0.0,    rec:0.0,    bF1:1.0,    ap:0,      tp:0,  fp:0,  fn:0,  tn:4096 },
    ],
  },
  { key:'unet', model:'UNet', icon:'U', color:'#00d4ff', bg:'rgba(0,212,255,.15)',
    iou:0.1985, f1:0.3312, prec:0.3377, rec:0.325, specificity:0.9958,
    boundary_f1:0.5021, ap:0.3035, roc_auc:0.9199, kappa:0.3269, mcc:0.327,
    tp:26, fp:51, fn:54, tn:12157, avg_conf:0.0175, max_conf:0.9514,
    mean_iou_patch:0.4667, std_iou_patch:0.411,
    params:'31.0M', depth:4, pretrain:'HR-GLDD', channels:17,
    samples: [
      { s:'Patch 0', iou:0.4,  f1:0.5714, prec:0.5532, rec:0.5909, bF1:0.5063, ap:0.5888, tp:26, fp:21, fn:18, tn:4031 },
      { s:'Patch 1', iou:0.0,  f1:0.0,    prec:0.0,    rec:0.0,    bF1:0.0,    ap:0.0427, tp:0,  fp:30, fn:36, tn:4030 },
      { s:'Patch 2', iou:1.0,  f1:0.0,    prec:0.0,    rec:0.0,    bF1:1.0,    ap:0,      tp:0,  fp:0,  fn:0,  tn:4096 },
    ],
  },
  { key:'attnunet', model:'Attn-UNet', icon:'AU', color:'#39ff7e', bg:'rgba(57,255,126,.15)',
    iou:0.1923, f1:0.3226, prec:0.2381, rec:0.5, specificity:0.9895,
    boundary_f1:0.4894, ap:0.4179, roc_auc:0.9754, kappa:0.3166, mcc:0.339,
    tp:40, fp:128, fn:40, tn:12080, avg_conf:0.1369, max_conf:0.9351,
    mean_iou_patch:0.4959, std_iou_patch:0.4083,
    params:'34.8M', depth:4, pretrain:'HR-GLDD', channels:17,
    samples: [
      { s:'Patch 0', iou:0.4878, f1:0.6557, prec:0.5128, rec:0.9091, bF1:0.4681, ap:0.7703, tp:40, fp:38, fn:4,  tn:4014 },
      { s:'Patch 1', iou:0.0,    f1:0.0,    prec:0.0,    rec:0.0,    bF1:0.0,    ap:0.0701, tp:0,  fp:90, fn:36, tn:3970 },
      { s:'Patch 2', iou:1.0,    f1:0.0,    prec:0.0,    rec:0.0,    bF1:1.0,    ap:0,      tp:0,  fp:0,  fn:0,  tn:4096 },
    ],
  },
  { key:'resunet', model:'ResUNet', icon:'R', color:'#ff6b35', bg:'rgba(255,107,53,.15)',
    iou:0.1442, f1:0.2521, prec:0.1899, rec:0.375, specificity:0.9895,
    boundary_f1:0.5185, ap:0.3557, roc_auc:0.9799, kappa:0.2456, mcc:0.2602,
    tp:30, fp:128, fn:50, tn:12080, avg_conf:0.0129, max_conf:0.9984,
    mean_iou_patch:0.4909, std_iou_patch:0.4033,
    params:'36.2M', depth:4, pretrain:'HR-GLDD', channels:17,
    samples: [
      { s:'Patch 0', iou:0.459,  f1:0.6292, prec:0.6222, rec:0.6364, bF1:0.5128, ap:0.7365, tp:28, fp:17,  fn:16, tn:4035 },
      { s:'Patch 1', iou:0.0136, f1:0.0268, prec:0.0177, rec:0.0556, bF1:0.0426, ap:0.0526, tp:2,  fp:111, fn:34, tn:3949 },
      { s:'Patch 2', iou:1.0,    f1:0.0,    prec:0.0,    rec:0.0,    bF1:1.0,    ap:0,      tp:0,  fp:0,   fn:0,  tn:4096 },
    ],
  },
  { key:'mmarunet', model:'MMAR-UNet', icon:'MM', color:'#c084fc', bg:'rgba(192,132,252,.15)',
    iou:0.0, f1:0.0, prec:0.0, rec:0.0, specificity:1.0,
    boundary_f1:0.3333, ap:0.0765, roc_auc:0.9129, kappa:0.0, mcc:0.0,
    tp:0, fp:0, fn:80, tn:12208, avg_conf:0.0078, max_conf:0.2235,
    mean_iou_patch:0.3333, std_iou_patch:0.4714,
    params:'41.1M', depth:5, pretrain:'HR-GLDD', channels:17,
    samples: [
      { s:'Patch 0', iou:0.0, f1:0.0, prec:0.0, rec:0.0, bF1:0.0, ap:0.246, tp:0, fp:0, fn:44, tn:4052 },
      { s:'Patch 1', iou:0.0, f1:0.0, prec:0.0, rec:0.0, bF1:0.0, ap:0.0245,tp:0, fp:0, fn:36, tn:4060 },
      { s:'Patch 2', iou:1.0, f1:0.0, prec:0.0, rec:0.0, bF1:1.0, ap:0,     tp:0, fp:0, fn:0,  tn:4096 },
    ],
  },
];

/* ─────────────────────────────────────
   4. T10 — channel_importance_occlusion
───────────────────────────────────── */
const CHAN_IMP = [
  { ch:'B2 (Blue)',    base:0.4935, occ:0.4915, drop:0.002,  norm:0.004324 },
  { ch:'B3 (Green)',   base:0.4935, occ:0.5298, drop:0.0,    norm:0.0 },
  { ch:'B4 (Red)',     base:0.4935, occ:0.4242, drop:0.0693, norm:0.14984 },
  { ch:'B5 (RE1)',     base:0.4935, occ:0.5068, drop:0.0,    norm:0.0 },
  { ch:'B6 (RE2)',     base:0.4935, occ:0.5023, drop:0.0,    norm:0.0 },
  { ch:'B7 (RE3)',     base:0.4935, occ:0.498,  drop:0.0,    norm:0.0 },
  { ch:'B8 (NIR)',     base:0.4935, occ:0.4771, drop:0.0164, norm:0.03546 },
  { ch:'B8A (NIR-n)',  base:0.4935, occ:0.505,  drop:0.0,    norm:0.0 },
  { ch:'B11 (SWIR1)',  base:0.4935, occ:0.031,  drop:0.4625, norm:1.0 },
  { ch:'B12 (SWIR2)',  base:0.4935, occ:0.5163, drop:0.0,    norm:0.0 },
  { ch:'NDVI',         base:0.4935, occ:0.5073, drop:0.0,    norm:0.0 },
  { ch:'NDWI',         base:0.4935, occ:0.4488, drop:0.0447, norm:0.09665 },
  { ch:'EVI',          base:0.4935, occ:0.1145, drop:0.379,  norm:0.81946 },
  { ch:'SAVI',         base:0.4935, occ:0.4936, drop:0.0,    norm:0.0 },
  { ch:'BSI',          base:0.4935, occ:0.5032, drop:0.0,    norm:0.0 },
  { ch:'NDSI',         base:0.4935, occ:0.489,  drop:0.0045, norm:0.00973 },
  { ch:'Slope',        base:0.4935, occ:0.5088, drop:0.0,    norm:0.0 },
];

/* ─────────────────────────────────────
   5. T8 — spectral_aggregate
───────────────────────────────────── */
const SPECTRAL = [
  { ch:'B2 (Blue)',   mean_in:0.478032, mean_out:0.143445, diff:0.334588 },
  { ch:'B3 (Green)',  mean_in:0.459125, mean_out:0.108661, diff:0.350465 },
  { ch:'B4 (Red)',    mean_in:0.463318, mean_out:0.172673, diff:0.290645 },
  { ch:'B5 (RE1)',    mean_in:0.371219, mean_out:0.461087, diff:-0.089869 },
  { ch:'B6 (RE2)',    mean_in:0.719037, mean_out:0.427663, diff:0.291374 },
  { ch:'B7 (RE3)',    mean_in:0.712741, mean_out:0.422628, diff:0.290113 },
  { ch:'B8 (NIR)',    mean_in:0.664569, mean_out:0.279989, diff:0.384580 },
  { ch:'B8A (NIR-n)', mean_in:0.363134, mean_out:0.565989, diff:-0.202855 },
  { ch:'B11 (SWIR1)', mean_in:0.216281, mean_out:0.645239, diff:-0.428959 },
  { ch:'B12 (SWIR2)', mean_in:0.482478, mean_out:0.450511, diff:0.031967 },
  { ch:'NDVI',        mean_in:0.258319, mean_out:0.352480, diff:-0.094162 },
  { ch:'NDWI',        mean_in:0.999991, mean_out:0.999627, diff:0.000365 },
  { ch:'EVI',         mean_in:0.510777, mean_out:0.510093, diff:0.000683 },
  { ch:'SAVI',        mean_in:0.411835, mean_out:0.304851, diff:0.106984 },
  { ch:'BSI',         mean_in:0.450946, mean_out:0.459737, diff:-0.008791 },
  { ch:'NDSI',        mean_in:0.505466, mean_out:0.295664, diff:0.209802 },
  { ch:'Slope',       mean_in:-0.621082, mean_out:-0.512453, diff:-0.108629 },
];

/* ─────────────────────────────────────
   6. T13 — error_distance_summary
───────────────────────────────────── */
const ERROR_DIST = [
  { model:'attnresunet', type:'FN', count:52,  mean:1.2342, median:1.0,  std:0.4146, q25:1.0,  q75:1.41 },
  { model:'attnresunet', type:'FP', count:40,  mean:4.5168, median:3.385,std:5.1485, q25:1.41, q75:5.025 },
  { model:'attnunet',    type:'FN', count:40,  mean:1.3398, median:1.0,  std:0.4578, q25:1.0,  q75:1.5575 },
  { model:'attnunet',    type:'FP', count:128, mean:11.2413,median:7.44, std:9.8515, q25:1.41, q75:20.455 },
  { model:'mmarunet',    type:'FN', count:80,  mean:1.2809, median:1.0,  std:0.4312, q25:1.0,  q75:1.41 },
  { model:'resunet',     type:'FN', count:50,  mean:1.2718, median:1.0,  std:0.4308, q25:1.0,  q75:1.41 },
  { model:'resunet',     type:'FP', count:128, mean:6.7129, median:6.08, std:4.9013, q25:3.0,  q75:8.6 },
  { model:'unet',        type:'FN', count:54,  mean:1.2517, median:1.0,  std:0.4205, q25:1.0,  q75:1.41 },
  { model:'unet',        type:'FP', count:51,  mean:2.9216, median:2.0,  std:1.8683, q25:1.0,  q75:4.735 },
];

/* ─────────────────────────────────────
   7. T15 — best_threshold_per_metric
───────────────────────────────────── */
const THRESH = [
  { model:'unet',        metric:'IoU',       best_thr:0.3, best_score:0.2438 },
  { model:'unet',        metric:'F1',        best_thr:0.3, best_score:0.392 },
  { model:'unet',        metric:'Precision', best_thr:0.9, best_score:0.6923 },
  { model:'unet',        metric:'Recall',    best_thr:0.1, best_score:0.6125 },
  { model:'attnunet',    metric:'IoU',       best_thr:0.8, best_score:0.2262 },
  { model:'attnunet',    metric:'F1',        best_thr:0.8, best_score:0.3689 },
  { model:'attnunet',    metric:'Precision', best_thr:0.9, best_score:1.0 },
  { model:'attnunet',    metric:'Recall',    best_thr:0.1, best_score:1.0 },
  { model:'resunet',     metric:'IoU',       best_thr:0.9, best_score:0.1855 },
  { model:'resunet',     metric:'F1',        best_thr:0.9, best_score:0.3129 },
  { model:'resunet',     metric:'Precision', best_thr:0.9, best_score:0.3433 },
  { model:'resunet',     metric:'Recall',    best_thr:0.1, best_score:0.525 },
  { model:'attnresunet', metric:'IoU',       best_thr:0.5, best_score:0.2333 },
  { model:'attnresunet', metric:'F1',        best_thr:0.5, best_score:0.3784 },
  { model:'attnresunet', metric:'Precision', best_thr:0.7, best_score:1.0 },
  { model:'attnresunet', metric:'Recall',    best_thr:0.1, best_score:1.0 },
  { model:'mmarunet',    metric:'IoU',       best_thr:0.1, best_score:0.0586 },
  { model:'mmarunet',    metric:'F1',        best_thr:0.1, best_score:0.1106 },
  { model:'mmarunet',    metric:'Precision', best_thr:0.2, best_score:0.2727 },
  { model:'mmarunet',    metric:'Recall',    best_thr:0.1, best_score:0.1625 },
];

/* ─────────────────────────────────────
   8. T16 — model_ranking_full
───────────────────────────────────── */
const RANKING = [
  { model:'Attn-ResUNet', iou:0.2333, f1:0.3784, prec:0.4118, rec:0.35,   ap:0.434,  roc_auc:0.9818, kappa:0.3746, mcc:0.3759, bF1:0.5219,
    iou_r:1, f1_r:1, prec_r:1, rec_r:3, ap_r:1, roc_r:1, kap_r:1, mcc_r:1, bf1_r:1 },
  { model:'UNet',         iou:0.1985, f1:0.3312, prec:0.3377, rec:0.325,  ap:0.3035, roc_auc:0.9199, kappa:0.3269, mcc:0.327,  bF1:0.5021,
    iou_r:2, f1_r:2, prec_r:2, rec_r:4, ap_r:4, roc_r:4, kap_r:2, mcc_r:3, bf1_r:3 },
  { model:'Attn-UNet',    iou:0.1923, f1:0.3226, prec:0.2381, rec:0.5,    ap:0.4179, roc_auc:0.9754, kappa:0.3166, mcc:0.339,  bF1:0.4894,
    iou_r:3, f1_r:3, prec_r:3, rec_r:1, ap_r:2, roc_r:3, kap_r:3, mcc_r:2, bf1_r:4 },
  { model:'ResUNet',      iou:0.1442, f1:0.2521, prec:0.1899, rec:0.375,  ap:0.3557, roc_auc:0.9799, kappa:0.2456, mcc:0.2602, bF1:0.5185,
    iou_r:4, f1_r:4, prec_r:4, rec_r:2, ap_r:3, roc_r:2, kap_r:4, mcc_r:4, bf1_r:2 },
  { model:'MMAR-UNet',    iou:0.0,    f1:0.0,    prec:0.0,    rec:0.0,    ap:0.0765, roc_auc:0.9129, kappa:0.0,    mcc:0.0,    bF1:0.3333,
    iou_r:5, f1_r:5, prec_r:5, rec_r:5, ap_r:5, roc_r:5, kap_r:5, mcc_r:5, bf1_r:5 },
];

/* ─────────────────────────────────────
   9. T4 — threshold sweep (aggregated)
───────────────────────────────────── */
const T4_THRESHOLDS = [0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9];
const T4_DATA = {
  unet:        { iou:[0.1612,0.2132,0.2438,0.2273,0.1985,0.1563,0.1094,0.0646,0.0188], f1:[0.2776,0.3515,0.392,0.3704,0.3312,0.2698,0.1974,0.1212,0.0368] },
  attnunet:    { iou:[0.1628,0.1895,0.2048,0.2152,0.2073,0.2068,0.1942,0.2262,0.1453], f1:[0.2804,0.3181,0.3400,0.3541,0.3442,0.3429,0.3251,0.3689,0.2541] },
  resunet:     { iou:[0.1298,0.1363,0.1366,0.1393,0.1399,0.1429,0.1423,0.1441,0.1855], f1:[0.2294,0.2398,0.2403,0.2445,0.2455,0.2501,0.2490,0.2519,0.3129] },
  attnresunet: { iou:[0.0932,0.1603,0.1971,0.2239,0.2333,0.2279,0.2062,0.1791,0.0862], f1:[0.1706,0.2761,0.3289,0.3651,0.3784,0.3718,0.3418,0.3035,0.1594] },
  mmarunet:    { iou:[0.0586,0.0536,0.0430,0.0287,0.0000,0.0000,0.0000,0.0000,0.0000], f1:[0.1106,0.1016,0.0826,0.0559,0.0000,0.0000,0.0000,0.0000,0.0000] },
};

/* ─────────────────────────────────────
   10. Radar chart
───────────────────────────────────── */
new Chart(document.getElementById('radarChart'), {
  type: 'radar',
  data: {
    labels: ['IoU×100','F1×100','Precision×100','Recall×100','ROC-AUC×100','Boundary F1×100'],
    datasets: EVAL.map(e => ({
      label:                e.model,
      data:                 [e.iou*100, e.f1*100, e.prec*100, e.rec*100, e.roc_auc*100, e.boundary_f1*100],
      borderColor:          e.color,
      backgroundColor:      e.color + '22',
      pointBackgroundColor: e.color,
      borderWidth: 2, pointRadius: 3,
    })),
  },
  options: {
    ...CD,
    plugins: {
      legend: { display:true, position:'bottom', labels:{ color:TICK, font:{size:10}, boxWidth:10, padding:14 } },
    },
    scales: {
      r: {
        min:0, max:100,
        ticks:      { color:TICK, font:{size:9}, backdropColor:'transparent', stepSize:20 },
        grid:       { color:GRID },
        pointLabels:{ color:'#7aa8c0', font:{size:9} },
        angleLines: { color:GRID },
      },
    },
  },
});

/* ─────────────────────────────────────
   11. Overview table
───────────────────────────────────── */
document.getElementById('overviewTable').innerHTML =
  `<thead><tr><th>Model</th><th>IoU %</th><th>F1 %</th><th>Prec %</th><th>Rec %</th><th>BF1 %</th><th>ROC-AUC</th><th>MCC</th></tr></thead><tbody>` +
  EVAL.map(e => `<tr>
    <td style="font-weight:800;color:${e.color}">${e.model}</td>
    <td>${(e.iou*100).toFixed(1)}</td>
    <td><strong style="color:${e.color}">${(e.f1*100).toFixed(1)}</strong></td>
    <td>${(e.prec*100).toFixed(1)}</td>
    <td>${(e.rec*100).toFixed(1)}</td>
    <td>${(e.boundary_f1*100).toFixed(1)}</td>
    <td>${e.roc_auc.toFixed(4)}</td>
    <td>${e.mcc.toFixed(4)}</td>
  </tr>`).join('') + `</tbody>`;

/* ─────────────────────────────────────
   12. Full ranking table
───────────────────────────────────── */
const rankColor = v => ['#39ff7e','#00d4ff','#ffb800','#ff6b35','#ff3d5a'][v-1] || '#888';
document.getElementById('rankingTable').innerHTML =
  `<thead><tr><th>Model</th><th>IoU</th><th>F1</th><th>Prec</th><th>Rec</th><th>AP</th><th>ROC-AUC</th><th>Kappa</th><th>MCC</th><th>BF1</th></tr></thead><tbody>` +
  RANKING.map(r => {
    const ec = EVAL.find(e => e.model === r.model || e.key === r.model.toLowerCase().replace(/[^a-z]/g,''));
    const c  = ec ? ec.color : '#888';
    return `<tr>
      <td style="font-weight:800;color:${c}">${r.model}</td>
      <td><span style="color:${rankColor(r.iou_r)};font-weight:700">#${r.iou_r}</span> <small style="color:var(--text3)">${(r.iou*100).toFixed(1)}%</small></td>
      <td><span style="color:${rankColor(r.f1_r)};font-weight:700">#${r.f1_r}</span></td>
      <td><span style="color:${rankColor(r.prec_r)};font-weight:700">#${r.prec_r}</span></td>
      <td><span style="color:${rankColor(r.rec_r)};font-weight:700">#${r.rec_r}</span></td>
      <td><span style="color:${rankColor(r.ap_r)};font-weight:700">#${r.ap_r}</span></td>
      <td><span style="color:${rankColor(r.roc_r)};font-weight:700">#${r.roc_r}</span></td>
      <td><span style="color:${rankColor(r.kap_r)};font-weight:700">#${r.kap_r}</span></td>
      <td><span style="color:${rankColor(r.mcc_r)};font-weight:700">#${r.mcc_r}</span></td>
      <td><span style="color:${rankColor(r.bf1_r)};font-weight:700">#${r.bf1_r}</span></td>
    </tr>`;
  }).join('') + `</tbody>`;

/* ─────────────────────────────────────
   13. Per-model detail panel
───────────────────────────────────── */
let f1ChartInst = null, iouChartInst = null;

function selectModel(key, btn) {
  document.querySelectorAll('.mb').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const e = EVAL.find(x => x.key === key);
  if (!e) return;

  document.getElementById('modelPanel').innerHTML = `
    <div class="md-hdr">
      <div class="md-icon" style="background:${e.bg};color:${e.color}">${e.icon}</div>
      <div>
        <div class="md-name">${e.model}</div>
        <div class="md-tag">Encoder–Decoder · Stage-2 Fine-tuned · ${e.channels}-ch Sentinel-2</div>
      </div>
    </div>
    <div class="md-mr">
      <div class="md-m"><div class="md-mv" style="color:${e.color}">${(e.iou*100).toFixed(1)}%</div><div class="md-ml">IoU</div></div>
      <div class="md-m"><div class="md-mv" style="color:${e.color}">${(e.f1*100).toFixed(1)}%</div><div class="md-ml">F1</div></div>
      <div class="md-m"><div class="md-mv" style="color:${e.color}">${(e.prec*100).toFixed(1)}%</div><div class="md-ml">Precision</div></div>
      <div class="md-m"><div class="md-mv" style="color:${e.color}">${(e.rec*100).toFixed(1)}%</div><div class="md-ml">Recall</div></div>
      <div class="md-m"><div class="md-mv" style="color:${e.color}">${e.roc_auc.toFixed(4)}</div><div class="md-ml">ROC-AUC</div></div>
    </div>
    <div class="md-extras">
      <div class="md-extra"><div class="md-el">Parameters</div><div class="md-ev" style="color:${e.color}">${e.params}</div><div class="md-es">Trainable weights</div></div>
      <div class="md-extra"><div class="md-el">Boundary F1</div><div class="md-ev" style="color:${e.color}">${(e.boundary_f1*100).toFixed(1)}%</div><div class="md-es">Perimeter fidelity</div></div>
      <div class="md-extra"><div class="md-el">Mean IoU/Patch</div><div class="md-ev" style="color:${e.color}">${(e.mean_iou_patch*100).toFixed(1)}%</div><div class="md-es">Patch-averaged</div></div>
      <div class="md-extra"><div class="md-el">TP / FP / FN</div><div class="md-ev" style="color:${e.color};font-size:.95rem">${e.tp} / ${e.fp} / ${e.fn}</div><div class="md-es">Confusion counts</div></div>
      <div class="md-extra"><div class="md-el">AP</div><div class="md-ev" style="color:${e.color}">${e.ap.toFixed(4)}</div><div class="md-es">Average Precision</div></div>
      <div class="md-extra"><div class="md-el">MCC</div><div class="md-ev" style="color:${e.color}">${e.mcc.toFixed(4)}</div><div class="md-es">Matthews Corr. Coeff.</div></div>
    </div>`;

  const labels  = e.samples.map(s => s.s);
  const f1data  = e.samples.map(s => +(s.f1*100).toFixed(2));
  const ioudata = e.samples.map(s => +(s.iou*100).toFixed(2));

  if (f1ChartInst)  f1ChartInst.destroy();
  if (iouChartInst) iouChartInst.destroy();

  f1ChartInst = new Chart(document.getElementById('f1Chart'), {
    type: 'bar',
    data: { labels, datasets:[{ data:f1data, backgroundColor:e.color+'55', borderColor:e.color, borderWidth:1.5, borderRadius:4, barPercentage:.5 }] },
    options: { ...CD, scales:{
      y:{ min:0, max:100, ticks:{ callback:v=>v+'%', color:TICK, font:{size:10} }, grid:{color:GRID} },
      x:{ ticks:{ color:TICK, font:{size:10} }, grid:{display:false} },
    }},
  });

  iouChartInst = new Chart(document.getElementById('iouChart'), {
    type: 'bar',
    data: { labels, datasets:[{ data:ioudata, backgroundColor:e.color+'55', borderColor:e.color, borderWidth:1.5, borderRadius:4, barPercentage:.5 }] },
    options: { ...CD, scales:{
      y:{ min:0, max:100, ticks:{ callback:v=>v+'%', color:TICK, font:{size:10} }, grid:{color:GRID} },
      x:{ ticks:{ color:TICK, font:{size:10} }, grid:{display:false} },
    }},
  });
}

/* ─────────────────────────────────────
   14. All-model F1 grouped bar
───────────────────────────────────── */
new Chart(document.getElementById('allF1Chart'), {
  type: 'bar',
  data: {
    labels: EVAL[0].samples.map(s => s.s),
    datasets: EVAL.map(e => ({
      label: e.model,
      data:  e.samples.map(s => +(s.f1*100).toFixed(2)),
      backgroundColor: e.color+'55', borderColor:e.color, borderWidth:1.5, borderRadius:3,
    })),
  },
  options: {
    ...CD,
    plugins:{ legend:{ display:true, position:'top', labels:{ color:TICK, font:{size:10}, boxWidth:10 } } },
    scales:{
      y:{ min:0, max:100, ticks:{ callback:v=>v+'%', color:TICK, font:{size:10} }, grid:{color:GRID} },
      x:{ ticks:{ color:TICK, font:{size:10} }, grid:{display:false} },
    },
  },
});

/* ─────────────────────────────────────
   15. Per-patch metrics table
───────────────────────────────────── */
const patchRows = [];
EVAL.forEach(e => e.samples.forEach(s => patchRows.push({ model:e.model, color:e.color, ...s })));
document.getElementById('patchTable').innerHTML =
  `<thead><tr><th>Model</th><th>Patch</th><th>IoU %</th><th>F1 %</th><th>Prec %</th><th>Rec %</th><th>BF1 %</th><th>AP</th><th>TP</th><th>FP</th><th>FN</th></tr></thead><tbody>` +
  patchRows.map(r => `<tr>
    <td style="font-weight:700;color:${r.color}">${r.model}</td>
    <td style="font-family:var(--fm);font-size:.68rem;color:var(--text3)">${r.s}</td>
    <td>${(r.iou*100).toFixed(2)}</td>
    <td>${(r.f1*100).toFixed(2)}</td>
    <td>${(r.prec*100).toFixed(2)}</td>
    <td>${(r.rec*100).toFixed(2)}</td>
    <td>${(r.bF1*100).toFixed(2)}</td>
    <td>${r.ap.toFixed(4)}</td>
    <td>${r.tp}</td><td>${r.fp}</td><td>${r.fn}</td>
  </tr>`).join('') + `</tbody>`;

/* ─────────────────────────────────────
   16. Band tab switcher
───────────────────────────────────── */
const BAND_MAP = {
  natural:  { img:'images/F5_1_band_Natural_Colour.png',     title:'Natural Colour — <span>B4·B3·B2 RGB</span>' },
  false:    { img:'images/F5_2_band_False_Colour.png',       title:'False Colour — <span>B8·B4·B3 NIR</span>' },
  swir:     { img:'images/F5_3_band_SWIR_Composite.png',     title:'SWIR Composite — <span>B12·B8A·B4</span>' },
  rededge:  { img:'images/F5_4_band_RedEdge_Composite.png',  title:'Red-Edge Composite — <span>B8A·B6·B5</span>' },
  veg:      { img:'images/F5_5_band_Vegetation.png',         title:'Vegetation Index — <span>NDVI Enhanced</span>' },
  urban:    { img:'images/F5_6_band_Urban.png',              title:'Urban Enhancement — <span>B12·B11·B4</span>' },
};

function showBand(key, btn) {
  document.querySelectorAll('.btab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const b = BAND_MAP[key];
  document.getElementById('bandImg').src    = b.img;
  document.getElementById('bandImg').alt    = key;
  document.getElementById('bandTitle').innerHTML = b.title;
}

/* ─────────────────────────────────────
   17. Channel importance chart
───────────────────────────────────── */
new Chart(document.getElementById('chanChart'), {
  type: 'bar',
  data: {
    labels: CHAN_IMP.map(c => c.ch),
    datasets: [{
      label: 'Normalised Importance',
      data: CHAN_IMP.map(c => c.norm),
      backgroundColor: CHAN_IMP.map(c => c.norm > .5 ? '#ffb800cc' : c.norm > .1 ? '#00d4ffcc' : '#3d647888'),
      borderColor:     CHAN_IMP.map(c => c.norm > .5 ? '#ffb800'   : c.norm > .1 ? '#00d4ff'   : '#3d6478'),
      borderWidth:1.5, borderRadius:3, barPercentage:.7,
    }],
  },
  options: {
    ...CD,
    plugins: { legend:{ display:false }, tooltip:{ ...CD.plugins.tooltip } },
    scales:{
      y:{ min:0, max:1.05, ticks:{ color:TICK, font:{size:9} }, grid:{color:GRID} },
      x:{ ticks:{ color:TICK, font:{size:8}, maxRotation:45 }, grid:{display:false} },
    },
  },
});

/* ─────────────────────────────────────
   18. Spectral bar charts
───────────────────────────────────── */
new Chart(document.getElementById('spectralBarChart'), {
  type: 'bar',
  data: {
    labels: SPECTRAL.map(s => s.ch),
    datasets: [
      { label:'Inside',  data:SPECTRAL.map(s => s.mean_in),  backgroundColor:'#ffb80077', borderColor:'#ffb800', borderWidth:1.5, borderRadius:2, barPercentage:.85 },
      { label:'Outside', data:SPECTRAL.map(s => s.mean_out), backgroundColor:'#00d4ff55', borderColor:'#00d4ff', borderWidth:1.5, borderRadius:2, barPercentage:.85 },
    ],
  },
  options: {
    ...CD,
    plugins:{ legend:{ display:true, position:'top', labels:{ color:TICK, font:{size:10}, boxWidth:10 } } },
    scales:{
      y:{ ticks:{ color:TICK, font:{size:9} }, grid:{color:GRID} },
      x:{ ticks:{ color:TICK, font:{size:8}, maxRotation:45 }, grid:{display:false} },
    },
  },
});

new Chart(document.getElementById('spectralDiffChart'), {
  type: 'bar',
  data: {
    labels: SPECTRAL.map(s => s.ch),
    datasets: [{
      label:'Difference',
      data: SPECTRAL.map(s => s.diff),
      backgroundColor: SPECTRAL.map(s => s.diff >= 0 ? '#39ff7e55' : '#ff3d5a55'),
      borderColor:     SPECTRAL.map(s => s.diff >= 0 ? '#39ff7e'   : '#ff3d5a'),
      borderWidth:1.5, borderRadius:2, barPercentage:.7,
    }],
  },
  options: {
    ...CD,
    scales:{
      y:{ ticks:{ color:TICK, font:{size:9} }, grid:{color:GRID} },
      x:{ ticks:{ color:TICK, font:{size:8}, maxRotation:45 }, grid:{display:false} },
    },
  },
});

/* ─────────────────────────────────────
   19. Channel stats table
───────────────────────────────────── */
const CHAN_STATS = [
  { name:'B2 (Blue)',   min:0.0,   max:1.0,   mean:0.163,  std:0.0993, median:0.1401, p5:0.0606,  p95:0.3245 },
  { name:'B3 (Green)',  min:0.0,   max:1.0,   mean:0.1082, std:0.0987, median:0.0815, p5:0.0325,  p95:0.2903 },
  { name:'B4 (Red)',    min:0.0,   max:1.0,   mean:0.1615, std:0.1696, median:0.1169, p5:0.0125,  p95:0.5281 },
  { name:'B5 (RE1)',    min:0.0492,max:1.0,   mean:0.5067, std:0.1862, median:0.5095, p5:0.2081,  p95:0.7943 },
  { name:'B6 (RE2)',    min:0.0814,max:1.0,   mean:0.3886, std:0.0855, median:0.4071, p5:0.2677,  p95:0.4949 },
  { name:'B7 (RE3)',    min:0.1766,max:1.0,   mean:0.4021, std:0.067,  median:0.404,  p5:0.3244,  p95:0.491 },
  { name:'B8 (NIR)',    min:0.0,   max:1.0,   mean:0.2451, std:0.1254, median:0.2378, p5:0.0609,  p95:0.4545 },
  { name:'B8A (NIR-n)', min:0.1057,max:1.0,   mean:0.5293, std:0.1126, median:0.5276, p5:0.351,   p95:0.7267 },
  { name:'B11 (SWIR1)', min:0.0,   max:1.0,   mean:0.6669, std:0.0972, median:0.7048, p5:0.5161,  p95:0.7616 },
  { name:'B12 (SWIR2)', min:0.0306,max:0.9981,mean:0.4659, std:0.0819, median:0.4656, p5:0.3404,  p95:0.5982 },
  { name:'NDVI',        min:0.0044,max:1.0,   mean:0.4589, std:0.2697, median:0.4753, p5:0.029,   p95:0.8932 },
  { name:'NDWI',        min:0.0,   max:1.0,   mean:0.9929, std:0.0834, median:1.0,    p5:0.9999,  p95:1.0 },
  { name:'EVI',         min:0.0,   max:1.0,   mean:0.5082, std:0.1316, median:0.5085, p5:0.2891,  p95:0.7304 },
  { name:'SAVI',        min:0.0,   max:1.0,   mean:0.3357, std:0.1689, median:0.3307, p5:0.0324,  p95:0.6298 },
  { name:'BSI',         min:0.0,   max:1.0,   mean:0.4767, std:0.1151, median:0.4711, p5:0.2882,  p95:0.672 },
  { name:'NDSI',        min:-1.0,  max:1.0,   mean:0.3585, std:0.573,  median:0.4246, p5:-0.864,  p95:0.9993 },
  { name:'Slope',       min:-1.0,  max:1.0,   mean:-0.5057,std:0.5362, median:-0.7169,p5:-0.9997, p95:0.637 },
];

document.getElementById('chanStatsTable').innerHTML =
  `<thead><tr><th>Channel</th><th>Min</th><th>Max</th><th>Mean</th><th>Std</th><th>Median</th><th>P5</th><th>P95</th></tr></thead><tbody>` +
  CHAN_STATS.map((c,i) => {
    const imp = CHAN_IMP[i] ? CHAN_IMP[i].norm : 0;
    const col = imp > .5 ? '#ffb800' : imp > .1 ? '#00d4ff' : 'var(--text)';
    return `<tr>
      <td style="font-weight:700;color:${col}">${c.name}</td>
      <td>${c.min.toFixed(4)}</td><td>${c.max.toFixed(4)}</td>
      <td>${c.mean.toFixed(4)}</td><td>${c.std.toFixed(4)}</td>
      <td>${c.median.toFixed(4)}</td><td>${c.p5.toFixed(4)}</td><td>${c.p95.toFixed(4)}</td>
    </tr>`;
  }).join('') + `</tbody>`;

/* ─────────────────────────────────────
   20. Error distance table + charts
───────────────────────────────────── */
document.getElementById('errorTable').innerHTML =
  `<thead><tr><th>Model</th><th>Type</th><th>Count</th><th>Mean (m)</th><th>Median (m)</th><th>Std</th><th>Q25</th><th>Q75</th></tr></thead><tbody>` +
  ERROR_DIST.map(r => {
    const ec = EVAL.find(e => e.key === r.model);
    const col = ec ? ec.color : '#888';
    const tc  = r.type === 'FP' ? '#ff3d5a' : '#ffb800';
    return `<tr>
      <td style="font-weight:700;color:${col}">${r.model}</td>
      <td style="font-family:var(--fm);font-size:.7rem;color:${tc}">${r.type}</td>
      <td>${r.count}</td>
      <td style="font-weight:700;color:${r.mean > 5 ? '#ff3d5a' : r.mean > 2 ? '#ffb800' : '#39ff7e'}">${r.mean.toFixed(4)}</td>
      <td>${r.median.toFixed(4)}</td><td>${r.std.toFixed(4)}</td>
      <td>${r.q25.toFixed(2)}</td><td>${r.q75.toFixed(4)}</td>
    </tr>`;
  }).join('') + `</tbody>`;

// FP mean distance chart
const fpModels = EVAL.map(e => e.key);
const fpDistData = fpModels.map(m => {
  const r = ERROR_DIST.find(d => d.model === m && d.type === 'FP');
  return r ? r.mean : 0;
});

new Chart(document.getElementById('fpDistChart'), {
  type: 'bar',
  data: {
    labels: fpModels,
    datasets: [{
      label:'Mean FP Distance (m)',
      data: fpDistData,
      backgroundColor: fpModels.map(m => (COLS[m]||'#888')+'55'),
      borderColor:     fpModels.map(m =>  COLS[m]||'#888'),
      borderWidth:1.5, borderRadius:3, barPercentage:.5,
    }],
  },
  options: { ...CD, scales:{
    y:{ ticks:{ color:TICK, font:{size:10} }, grid:{color:GRID} },
    x:{ ticks:{ color:TICK, font:{size:9} }, grid:{display:false} },
  }},
});

new Chart(document.getElementById('fpfnChart'), {
  type: 'bar',
  data: {
    labels: EVAL.map(e => e.model),
    datasets: [
      { label:'FP', data:EVAL.map(e => e.fp), backgroundColor:'#ff3d5a55', borderColor:'#ff3d5a', borderWidth:1.5, borderRadius:2, barPercentage:.85 },
      { label:'FN', data:EVAL.map(e => e.fn), backgroundColor:'#ffb80055', borderColor:'#ffb800', borderWidth:1.5, borderRadius:2, barPercentage:.85 },
    ],
  },
  options: {
    ...CD,
    plugins:{ legend:{ display:true, position:'top', labels:{ color:TICK, font:{size:10}, boxWidth:10 } } },
    scales:{
      y:{ ticks:{ color:TICK, font:{size:10} }, grid:{color:GRID} },
      x:{ ticks:{ color:TICK, font:{size:9} }, grid:{display:false} },
    },
  },
});

/* ─────────────────────────────────────
   21. Threshold table
───────────────────────────────────── */
document.getElementById('thresholdTable').innerHTML =
  `<thead><tr><th>Model</th><th>Metric</th><th>Best Threshold</th><th>Best Score</th></tr></thead><tbody>` +
  THRESH.map(r => {
    const ec = EVAL.find(e => e.key === r.model);
    const col = ec ? ec.color : '#888';
    return `<tr>
      <td style="font-weight:700;color:${col}">${r.model}</td>
      <td style="font-family:var(--fm);font-size:.7rem;color:var(--text3)">${r.metric}</td>
      <td style="font-weight:700">${r.best_thr}</td>
      <td style="font-weight:700;color:${r.best_score > .5 ? '#39ff7e' : r.best_score > .25 ? '#00d4ff' : '#ffb800'}">${r.best_score.toFixed(4)}</td>
    </tr>`;
  }).join('') + `</tbody>`;

/* ─────────────────────────────────────
   22. Threshold sweep charts
───────────────────────────────────── */
new Chart(document.getElementById('threshIouChart'), {
  type: 'line',
  data: {
    labels: T4_THRESHOLDS,
    datasets: EVAL.map(e => ({
      label: e.model,
      data:  T4_DATA[e.key] ? T4_DATA[e.key].iou : [],
      borderColor: e.color, backgroundColor:'transparent',
      borderWidth:2, pointRadius:3, pointBackgroundColor:e.color, tension:.3,
    })),
  },
  options: {
    ...CD,
    plugins:{ legend:{ display:true, position:'top', labels:{ color:TICK, font:{size:9}, boxWidth:10 } } },
    scales:{
      y:{ min:0, max:.35, ticks:{ color:TICK, font:{size:9} }, grid:{color:GRID} },
      x:{ title:{ display:true, text:'Threshold', color:TICK, font:{size:9} }, ticks:{ color:TICK, font:{size:9} }, grid:{display:false} },
    },
  },
});

new Chart(document.getElementById('threshF1Chart'), {
  type: 'line',
  data: {
    labels: T4_THRESHOLDS,
    datasets: EVAL.map(e => ({
      label: e.model,
      data:  T4_DATA[e.key] ? T4_DATA[e.key].f1 : [],
      borderColor: e.color, backgroundColor:'transparent',
      borderWidth:2, pointRadius:3, pointBackgroundColor:e.color, tension:.3,
    })),
  },
  options: {
    ...CD,
    plugins:{ legend:{ display:true, position:'top', labels:{ color:TICK, font:{size:9}, boxWidth:10 } } },
    scales:{
      y:{ min:0, max:.5, ticks:{ color:TICK, font:{size:9} }, grid:{color:GRID} },
      x:{ title:{ display:true, text:'Threshold', color:TICK, font:{size:9} }, ticks:{ color:TICK, font:{size:9} }, grid:{display:false} },
    },
  },
});

/* ─────────────────────────────────────
   23. Pipeline
───────────────────────────────────── */
const PIPE = [
  { name:'prepare_dataset.py',            desc:'Rasterize polygons · compute 17 channels · tile 64×64 patches · manual event split',  done:true },
  { name:'train_hrgldd_pretrain.py',      desc:'Stage 1: Pretrain UNet on HR-GLDD (4-ch RGB+NIR) — 40 epochs on Tesla T4',           done:true },
  { name:'Train_Models.py',               desc:'Stage 2: Fine-tune 5 architectures on 17-ch Sentinel-2 — 80 epochs with HNM',         done:true },
  { name:'Evaluation_IG_GradCAM.py',      desc:'Pixel metrics (P/R/F1/IoU/MCC) + Integrated Gradients + Grad-CAM XAI',               done:true },
  { name:'Landslide_Object_Extraction.py',desc:'Convert masks → terrain-filtered connected regions → GeoJSON polygons',               done:true },
  { name:'LMCS_Evaluation.py',            desc:'Novel morphology metric: area · elongation · compactness per polygon',                done:true },
  { name:'Boundary_Evaluation.py',        desc:'Hausdorff · Chamfer · Boundary F1 against GT masks',                                  done:true },
  { name:'Signed_Distance_Error_Map.py',  desc:'Spatial boundary error: signed distance over/under-prediction maps',                  done:true },
  { name:'FM_Visualization_Dashboard.py', desc:'Streamlit interactive feature map and XAI visualisation dashboard',                   done:false },
];

const pipeEl = document.getElementById('pipeEl');
pipeEl.innerHTML = PIPE.map((s, i) => `
  <div class="pipe-step" style="transition-delay:${i*80}ms">
    <div class="pdot ${s.done?'done':'pend'}"></div>
    <div>
      <div class="pipe-name">${s.name}</div>
      <div class="pipe-desc">${s.desc}</div>
    </div>
    <div class="pipe-tag ${s.done?'done':'pend'}">${s.done?'Complete':'Pending'}</div>
  </div>`).join('');

const pObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting)
      entry.target.querySelectorAll('.pipe-step').forEach(s => s.classList.add('visible'));
  });
}, { threshold:.1 });
pObs.observe(pipeEl);

/* ─────────────────────────────────────
   24. Boot — initialise defaults
───────────────────────────────────── */
selectModel('attnresunet', document.querySelector('.mb.active'));
