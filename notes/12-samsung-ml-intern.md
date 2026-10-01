# Samsung Research — ML Intern

Multi-modal ML pipeline in Python/Pandas over 10,000+ sensor points across 3 datasets; 20% accuracy improvement; 4-person team.

**30 seconds** Internship: built a multi-modal ML pipeline — merged sensor datasets in Pandas, feature engineering, model training with a team of four; improved holdout accuracy about 20% over baseline.

**Q:** What does multi-modal mean here?

Multiple sensor modalities — e.g. accelerometer + gyro + environmental — fused into one feature matrix. Each modality = one dataset or channel; model combines them (early fusion: concat features; late fusion: ensemble predictions).

**Q:** Pipeline stages

Collect → clean (missing values, outliers) → normalize → feature extract → train/val/test split (70/15/15) → train classifier/regressor → evaluate → error analysis. Python: Pandas, scikit-learn or similar.

**Q:** 20% improvement — math

If baseline accuracy 0.75 and new 0.90 → (0.90-0.75)/0.75 = 20% relative improvement. State whether metric was accuracy, F1, or RMSE. Mention you avoided train/test leakage (same device not in both splits).

**Q:** Your role in 4-person team?

Be specific: “I owned data cleaning and feature pipeline” or “I ran experiments on fusion architecture.” Don’t claim sole credit for 20%.
