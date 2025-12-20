# **Email Verification & User Profile System - Quick Reference**

---

## **Email Verification Flow**

### **Architecture Overview**

```
User clicks "Send Email"
    ↓
Backend generates token (secrets.token_urlsafe(32))
    ↓
Token saved to DB with 24hr expiration
    ↓
Email sent via SES (NOT SNS) with magic link
    ↓
User clicks link → Frontend extracts token from URL
    ↓
Frontend calls POST /verify with token
    ↓
Backend validates: exists? not expired? → Mark verified
    ↓
Token deleted (single-use security)
```

### **Key Security Principles**

**Token Generation:**
```python
import secrets
token = secrets.token_urlsafe(32)  # 256 bits of entropy
# Never use random.randint() for security!
```

**Why cryptographically secure?**
- `random` = predictable, guessable
- `secrets` = cryptographically random, impossible to guess
- 2^256 possible values

**Token Lifecycle:**
1. Generate → Save to DB with expiration
2. Send in email link
3. User clicks → Validate
4. Delete immediately (single-use)

**Validation Checks:**
```python
# 1. Token exists in database?
user = db.query(User).filter(User.verification_code == token).first()
if not user: raise HTTPException(400, "Invalid token")

# 2. Token not expired?
if user.verification_expires < datetime.utcnow(): 
    raise HTTPException(400, "Token expired")

# 3. Mark verified and DELETE token
user.email_verified = True
user.verification_code = None  # Single-use!
```

---

## **SES vs SNS - Critical Difference**

### **SES (Simple Email Service)**
**Use for:** Transactional emails (verification, password reset)
- Sends email DIRECTLY to recipient
- No subscription required
- Like using Gmail API or SendGrid

```python
ses_client.send_email(
    Source="noreply@domain.com",
    Destination={"ToAddresses": ["user@email.com"]},
    Message={...}
)
```

### **SNS (Simple Notification Service)**
**Use for:** Optional notifications (task shared, comments)
- Publish/subscribe model
- User must subscribe to topic first
- User controls preferences

```python
sns_client.publish(
    TopicArn="arn:aws:sns:...",
    Message="...",
    MessageAttributes={...}
)
```

**When to use which:**
- Verification emails → **SES** (must work immediately)
- Task notifications → **SNS** (user opts in)

---

## **SES Setup Checklist**

### **Development (Sandbox Mode)**

✅ Can send TO: Verified emails only  
❌ Can send TO: Random emails

**Steps:**
1. AWS SES → Verify identity → Enter email
2. Check inbox → Click confirmation link
3. Can now send TO and FROM that email

### **Production Access**

**Request production access:**
1. AWS SES → Account Dashboard → Request production access
2. Fill form:
   - Use case: "Task management notifications"
   - Email type: "Transactional"
   - Volume: "< 1000/day"
3. Approval: Usually 24 hours

**After approval:**
✅ Can send to ANY email address

### **Domain Verification**

**For sending from `noreply@yourdomain.com`:**

1. AWS SES → Verify domain → Enter `yourdomain.com`
2. AWS gives you DNS records (3 CNAME records for DKIM)
3. Add to Cloudflare:
   - Type: CNAME
   - Name: `abc123._domainkey` (remove domain part)
   - Target: `abc123.dkim.amazonses.com`
   - Proxy: OFF (gray cloud)
4. Wait 5-10 minutes → AWS shows "Verified"

**Benefits:**
- Send from ANY email at that domain
- Better deliverability (DKIM authentication)
- Professional branding

---

## **React Patterns Used**

### **State Management for Async Actions**

```javascript
const [loading, setLoading] = useState(false);
const [success, setSuccess] = useState(false);
const [error, setError] = useState('');

const handleAction = async () => {
  setLoading(true);
  setError('');
  
  try {
    await api.post('/endpoint');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  } catch (err) {
    setError(err.response?.data?.detail || 'Failed');
  } finally {
    setLoading(false);  // Always runs
  }
};
```

**Why three states?**
- `loading`: Show spinner, disable button
- `success`: Show success message
- `error`: Show error message

**Pattern:** Track each phase separately for clear UI feedback

### **Dirty State Tracking**

```javascript
const [data, setData] = useState(null);
const [hasChanges, setHasChanges] = useState(false);

const handleChange = (key, value) => {
  setData({...data, [key]: value});
  setHasChanges(true);  // Mark as dirty
};

const handleSave = async () => {
  await api.patch('/endpoint', data);
  setHasChanges(false);  // Clean state
};

const handleCancel = () => {
  fetchData();  // Reload from server
  setHasChanges(false);
};
```

**Purpose:** Show save/cancel buttons only when needed

### **URL Parameter Extraction (Without React Router)**

```javascript
// Get token from URL: http://localhost:5173/?token=abc123
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');  // → "abc123"

// Clean up URL after use
window.history.replaceState({}, document.title, '/');
// Before: /?token=abc123
// After:  /
```

### **Conditional Rendering Patterns**

```javascript
// Loading state
if (loading) return <Spinner />;

// Error state
if (error) return <ErrorMessage />;

// Success state
return <Content />;
```

**Hierarchy:** Loading → Error → Success

---

## **Python/Backend Patterns**

### **Nested Dictionary Building**

**SES Message Structure:**
```python
# Build incrementally
message = {
    "Subject": {"Data": subject},
    "Body": {}
}

# Add text version
message["Body"]["Text"] = {"Data": body_text}

# Add HTML version
message["Body"]["Html"] = {"Data": body_html}

# Final structure:
{
    "Subject": {"Data": "..."},
    "Body": {
        "Text": {"Data": "..."},
        "Html": {"Data": "..."}
    }
}
```

**Accessing nested values:**
```python
message["Body"]["Text"]           # → {"Data": "..."}
message["Body"]["Text"]["Data"]   # → "actual text"
```

### **Try/Catch/Finally Pattern**

```python
try:
    result = risky_operation()
    return result
except SpecificError as e:
    handle_specific_error(e)
except Exception as e:
    handle_general_error(e)
finally:
    cleanup()  # ALWAYS runs (success or error)
```

**When to use `finally`:**
- Closing files/connections
- Releasing locks
- Clearing loading states
- Anything that must happen regardless

### **Timezone-Aware vs Naive Datetimes**

```python
# Naive (no timezone info)
datetime.utcnow()  # → 2025-12-19 15:30:00

# Aware (has timezone)
datetime.now(timezone.utc)  # → 2025-12-19 15:30:00+00:00
```

**Comparison rules:**
```python
# ❌ Can't compare naive and aware
naive < aware  # TypeError!

# ✅ Both naive
datetime.utcnow() < datetime.utcnow() + timedelta(hours=1)

# ✅ Both aware
datetime.now(timezone.utc) < datetime.now(timezone.utc) + timedelta(hours=1)
```

**Database columns:**
```python
# Naive
expires = Column(DateTime)

# Aware (better for multi-timezone apps)
expires = Column(DateTime(timezone=True))
```

---

## **Testing Patterns**

### **Pytest Fixture Dependency Injection**

**How it works:**
```python
# conftest.py
@pytest.fixture
def db_session():
    # Setup
    session = create_test_session()
    yield session
    # Teardown
    session.close()

# test_file.py
def test_something(db_session):  # ← Pytest injects it!
    user = db_session.query(User).first()
```

**Pytest matches parameter names to fixture names:**
- Parameter `db_session` → Calls `db_session()` fixture
- Parameter `client` → Calls `client()` fixture
- No imports needed!

### **Database vs HTTP in Tests**

```python
# ❌ Wrong - client is for HTTP, not DB
def test_something(client):
    user = client.query(User)  # AttributeError!

# ✅ Correct - db_session for DB
def test_something(client, db_session):
    user = db_session.query(User).first()  # Works!
    
    response = client.post("/tasks", ...)  # Works!
```

**Remember:**
- `client` → HTTP requests (`client.post`, `client.get`)
- `db_session` → Database queries (`db_session.query`)

### **Test Helpers**

```python
# Create reusable helper
def mark_email_verified(db_session, username):
    user = db_session.query(User).filter(
        User.username == username
    ).first()
    
    prefs = get_or_create_preferences(user.id, db_session)
    prefs.email_verified = True
    db_session.commit()

# Use in tests
def test_notifications(client, db_session, ...):
    create_user_and_token("alice", ...)
    mark_email_verified(db_session, "alice")  # Clean!
    
    # Test continues...
```

**Benefits:**
- DRY (Don't Repeat Yourself)
- Clearer test intent
- Easy to update

---

## **Database Migration Best Practices**

### **Before Production**

**Clean up mistakes:**
```bash
# Revert bad migration
alembic downgrade -1

# Delete the file
rm alembic/versions/bad_migration.py

# Create proper one
alembic revision -m "proper_migration"
```

**Why:** Keep clean history for production

### **After Production**

**Never delete migrations!**
- Create forward-only fixes
- Keep audit trail
- Other developers/servers depend on history

### **Setting Column Defaults**

**Both places needed:**
```python
# 1. Python model (db_models.py)
class User(Base):
    email_verified = Column(Boolean, default=False)

# 2. SQL migration
def upgrade():
    op.alter_column('users', 'email_verified',
                    server_default='false')
```

**Why both?**
- Python default: When creating objects in code
- SQL default: When DB creates rows directly

### **Updating Existing Rows**

```python
def upgrade():
    # 1. Set column default
    op.alter_column('table', 'column', server_default='value')
    
    # 2. Update existing NULLs
    op.execute("""
        UPDATE table
        SET column = COALESCE(column, 'value')
    """)
```

**COALESCE:** "If NULL, set to value; otherwise keep existing"

---

## **CORS Configuration**

### **What is CORS?**

**Without CORS:**
```
Frontend (localhost:5173) → Backend (localhost:8000)
                             ↓
                        ❌ Browser blocks
```

**With CORS:**
```
Frontend (localhost:5173) → Backend (localhost:8000)
                             ↓
                        ✅ Backend says "allowed"
```

### **FastAPI Setup**

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Dev: All origins
    # allow_origins=["https://myapp.com"],  # Prod: Specific
    allow_credentials=True,  # Allow cookies/auth
    allow_methods=["*"],     # Allow all HTTP methods
    allow_headers=["*"],     # Allow all headers
)
```

**Important:** Add BEFORE routes, right after `app = FastAPI()`

### **Production Settings**

```python
allow_origins=[
    "http://localhost:5173",      # Local dev
    "https://myapp.com",          # Production
    "https://www.myapp.com",      # Production with www
]
```

---

## **Deployment Debugging**

### **EC2 Docker Commands**

```bash
# List containers
docker ps

# View logs (live)
docker logs -f $(docker ps -q)

# View recent logs
docker logs --tail 50 $(docker ps -q)

# Restart container
docker restart $(docker ps -q)

# Shell into container
docker exec -it $(docker ps -q) bash

# Check environment variables
docker exec $(docker ps -q) env | grep AWS
```

### **Verify Deployment**

```bash
# Check API docs
curl http://your-ec2-ip:8000/docs

# Test endpoint
curl -X POST http://your-ec2-ip:8000/endpoint \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'

# Check CORS headers
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     http://your-ec2-ip:8000/endpoint \
     -v
# Should see: Access-Control-Allow-Origin: *
```

### **Common Issues**

**404 Not Found:**
- Endpoint doesn't exist
- Router not registered in main.py
- Container running old code

**500 Internal Server Error:**
- Check Docker logs for traceback
- Common: Missing env vars, DB connection issues

**CORS Blocked:**
- CORS middleware not added
- Container not restarted after code change
- 404/500 errors don't return CORS headers

---

## **Key Concepts Learned**

### **Separation of Concerns**

**Two endpoints better than one:**
```python
# ✅ Good
POST /send-verification  # Generates token, sends email
POST /verify             # Validates token

# ❌ Bad
POST /verify?action=send  # Does two different things
POST /verify?action=check
```

**Why:** Clear responsibilities, easier to test, better REST design

### **Authentication vs Authorization**

```python
# Verification endpoint - NO auth required
@router.post("/verify")
def verify(token: str):
    # User not logged in (clicking from email)
    
# Send verification - Auth required  
@router.post("/send-verification")
def send(user: User = Depends(get_current_user)):
    # User must be logged in
```

### **Client State vs Server State**

**Client (React):**
```javascript
const [preferences, setPreferences] = useState({...})
// User can change locally
```

**Server (Database):**
```
Actual stored values
```

**Sync on save:**
```javascript
const handleSave = async () => {
  const response = await api.patch('/preferences', preferences);
  setPreferences(response.data);  // Use server's version (source of truth)
};
```

---

## **Quick Reference Commands**

### **Alembic**
```bash
alembic revision -m "description"      # Create migration
alembic upgrade head                   # Apply migrations
alembic downgrade -1                   # Revert one migration
alembic current                        # Show current version
alembic upgrade head --sql > file.sql  # Preview SQL
```

### **Pytest**
```bash
pytest tests/                          # Run all tests
pytest tests/test_file.py              # Run one file
pytest tests/test_file.py::test_name   # Run one test
pytest -v                              # Verbose output
pytest -k "notification"               # Run tests matching pattern
```

### **Git (Clean History)**
```bash
git log --oneline                      # View commits
git reset --soft HEAD~1                # Undo last commit (keep changes)
git reset --hard HEAD~1                # Undo last commit (delete changes)
git commit --amend                     # Modify last commit
```

---

## **Production Checklist**

Before deploying email verification:

- [ ] SES production access approved
- [ ] Domain verified in SES
- [ ] CORS configured for production domain
- [ ] Environment variables set on EC2
- [ ] Email templates tested
- [ ] Token expiration tested (24 hours)
- [ ] All tests passing
- [ ] Frontend error handling tested
- [ ] Email deliverability tested
- [ ] HTTPS configured (for production links)

---

**End of Cheatsheet**

*Save this for reference when building similar features or debugging issues!*