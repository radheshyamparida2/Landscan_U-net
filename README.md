# LandScan AI — Landslide Detection System (Integrated Edition)

A fully static, GitHub Pages–ready research dashboard presenting deep-learning landslide
detection results from Sentinel-2 multispectral imagery.  
This edition integrates **31 result figures** and **19 CSV data tables** into the dashboard.

## Project Structure

```
my-project/
├── index.html        ← main page (all sections, fully integrated)
├── style.css         ← all styles (CSS variables, layout, animations)
├── script.js         ← all CSV data baked-in, Chart.js setup, interactivity
├── README.md
├── images/           ← result figures (F1–F21 + sample patches)
│   ├── F1_model_metrics_bar.png
│   ├── F2_extended_metrics.png
│   ├── F3_per_patch_iou_heatmap.png
│   ├── F4_per_patch_f1_heatmap.png
│   ├── F5_1_band_Natural_Colour.png
│   ├── F5_2_band_False_Colour.png
│   ├── F5_3_band_SWIR_Composite.png
│   ├── F5_4_band_RedEdge_Composite.png
│   ├── F5_5_band_Vegetation.png
│   ├── F5_6_band_Urban.png
│   ├── F6_1_all_models_Natural_Colour.png
│   ├── F6_2_all_models_False_Colour.png
│   ├── F6_3_all_models_SWIR_Composite.png
│   ├── F7_confidence_maps_all_models.png
│   ├── F8_threshold_sensitivity.png
│   ├── F9_threshold_sweep_visual.png
│   ├── F10_pr_roc_curves.png
│   ├── F11_per_patch_pr_roc.png
│   ├── F12_spectral_signature.png
│   ├── F13_per_patch_spectral_profiles.png
│   ├── F14_channel_contrast_patches.png
│   ├── F15_channel_importance_occlusion.png
│   ├── F16_confusion_matrices.png
│   ├── F17_confusion_matrices_raw.png
│   ├── F18_error_distance_profiles.png
│   ├── F19_best_predictions_multiband.png
│   ├── F19_worst_predictions_multiband.png
│   ├── F20_fp_zoom_multiband.png
│   ├── F20_fn_zoom_multiband.png
│   ├── F21_radar_chart.png
│   ├── sample_0.png
│   ├── sample_1.png
│   └── sample_2.png
└── CSV/              ← source data tables (used to populate script.js constants)
    ├── T1_model_metrics_full.csv
    ├── T2_per_patch_metrics.csv
    ├── T3_per_patch_iou_pivot.csv
    ├── T4_threshold_sweep.csv
    ├── T5_pr_curve_data.csv
    ├── T6_roc_curve_data.csv
    ├── T7_spectral_per_patch.csv
    ├── T8_spectral_aggregate.csv
    ├── T9_channel_contrast_by_patch.csv
    ├── T10_channel_importance_occlusion.csv
    ├── T11_confusion_matrices.csv
    ├── T12_error_distances.csv
    ├── T13_error_distance_summary.csv
    ├── T14_patch_ranking_best_model.csv
    ├── T15_best_threshold_per_metric.csv
    ├── T16_model_ranking_full.csv
    ├── T17_dataset_statistics.csv
    └── T18_channel_statistics.csv
```

## Dashboard Sections

| Section | Content |
|---------|---------|
| **Overview** | Key metric cards · Radar chart · Full metrics table · F1 bar · F2 extended · F21 radar · Ranking table |
| **Performance** | F3 IoU heatmap · F4 F1 heatmap · Per-model detail panel · Per-sample bar charts · Full patch table |
| **Imagery** | F5 band composites (6 tabs) · Sample patches 0/1/2 |
| **Confidence** | F7 confidence maps · F6 overlays (Natural / False / SWIR) |
| **Threshold** | F8 sensitivity · F9 visual sweep · F10 PR/ROC · F11 per-patch PR/ROC · Best-threshold table · Sweep line charts |
| **Spectral** | F12 signatures · F13 per-patch profiles · F14 contrast · Channel stats table · Inside/outside bar · Difference chart |
| **Channels** | F15 occlusion importance · F16/F17 confusion matrices · Importance bar chart |
| **Errors** | F18 error profiles · Error distance summary table · FP distance chart · FP/FN counts chart |
| **Predictions** | F19 best/worst multiband · F20 FP/FN zoomed patches |
| **Pipeline** | 9-step animated research workflow |

## CSV → JS Data Mapping

All numerical data from the CSV tables is baked into `script.js` as named `const` blocks
so the site requires **zero server-side processing**:

| `const` in script.js | Source CSV |
|----------------------|-----------|
| `EVAL`               | T1 + T2 |
| `CHAN_IMP`           | T10 |
| `SPECTRAL`           | T8 |
| `ERROR_DIST`         | T13 |
| `THRESH`             | T15 |
| `RANKING`            | T16 |
| `CHAN_STATS`         | T18 |
| `T4_DATA`            | T4 (aggregated) |

To update results: edit the corresponding `const` block in `script.js`.

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository
2. Go to **Settings → Pages → Source → main branch / root**
3. Your site will be live at `https://<username>.github.io/<repo>/`

No build step · No Node.js · No server · 100% static HTML/CSS/JS.

## Tech Stack

- Vanilla HTML / CSS / JS — zero framework dependencies
- [Chart.js 4.4.1](https://www.chartjs.org/) via CDN
- CSS custom properties for full theming
- IntersectionObserver for scroll-triggered pipeline animation
- Lazy-loaded images (`loading="lazy"`) for performance
