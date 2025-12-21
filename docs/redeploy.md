# Redeployment Checklist

## Phase 1: The Cleanup (Destroy & Release)

### 1. **Release the Domain (Crucial for CNAME Error)**
* Go to **Cloudflare DNS Dashboard**.
* Edit or delete `faros` CNAME record.


### 2. **Destroy Infrastructure**
* Run this in your terminal:
```bash
terraform destroy -auto-approve
```
* **Bucket not empty:** Run this command to empty it
```bash
aws s3 rm s3://<BUCKET_NAME> --recursive
```

### 3. **Wait 2 Minutes**
* Give AWS global systems a moment to realize the old CloudFront distribution is truly gone and the domain is released.

### 4. **Deploy New Infrastructure**
* Run:
```bash
terraform apply
terraform output
```
### 5. **Retrieve New Identities**
* **Copy these 3 values:**
* `frontend_bucket_name` (e.g., `faros-frontend-abc12345`)
* `cloudfront_distribution_id` (e.g., `E987654321...`)
* `cloudfront_domain` (e.g., `d12345xyz.cloudfront.net`)

### 6. **Update GitHub Secrets (Frontend Repo)**
* Go to **GitHub** -> **Frontend Repo** -> **Settings** -> **Secrets** -> **Actions**.
* Update **`S3_BUCKET_NAME`** with the new `frontend_bucket_name`.
* Update **`CLOUDFRONT_DISTRIBUTION_ID`** with the new `cloudfront_distribution_id`.


### 7. **Update Cloudflare DNS**
* Go back to **Cloudflare**.
* Edit the `faros` CNAME record again.
* Change **Target** to new **`cloudfront_domain`** value.
* Ensure **Proxy Status** is **DNS Only** (Grey Cloud).

### 8. **Deploy Frontend**
* Go to **GitHub Actions** in your frontend repo.
* Select **Deploy Frontend**.
* Click **Run workflow**.

### 9. **Verify**
* Wait ~2 minutes for the deploy to finish and DNS to propagate.
* Visit `https://faros.odysian.dev`.