# Campus Lost & Found: SE2020 Individual Assignment

React Native (Expo) + Node/Express + MongoDB Atlas.
**Primary entity:** Item (full CRUD + image upload). **Related entity:** Claim (references Item and User, status workflow). Users are separate.

## Business logic (explain this in the viva)
- A user cannot claim their own item, cannot claim an item that is already `Returned`, and cannot hold two active claims on one item (409/400).
- **Approving** a claim sets the Item to `Returned` and auto-rejects every other `Pending` claim on that item.
- **Cancelling an Approved** claim sets the Item back to `Open`.
- Only the reporter can approve/reject/edit/delete their item; only the claimant can edit (while Pending), cancel or delete (when Rejected/Cancelled) their claim.
- Deleting an item deletes its claims and its image file.

## 1. Run the backend locally (week 1-2 only)
```
cd backend
npm install
cp .env.example .env     # fill in MONGO_URI and JWT_SECRET
npm run dev
```
.env variable names to list in your report (values redacted): `PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`

## 2. Deploy (do this in week 3)
1. MongoDB Atlas: create free cluster -> Database Access (user) -> Network Access (allow 0.0.0.0/0) -> copy connection string into `MONGO_URI`.
2. Push repo to GitHub. On Render: New Web Service -> root directory `backend`, build `npm install`, start `npm start`, add the 4 env vars.
3. Open `https://<your-app>.onrender.com/` - you should see `{"status":"ok"}`.
4. Note: Render's free disk is **ephemeral** (uploaded images vanish on redeploy/restart). For a stable demo, avoid redeploying just before the viva, or move uploads to Cloudinary/S3 and mention this in your reflection.
5. Free instances sleep: open the URL 1-2 minutes before your demo.

## 3. Run the mobile app
```
npx create-expo-app@latest lostfound-mobile --template blank
cd lostfound-mobile
npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context expo-image-picker expo-secure-store
npm install axios
```
Then copy `mobile/App.js` over the generated `App.js`, copy `mobile/src/` into the project, and set `BASE_URL` in `src/config.js` to your Render URL. Run `npx expo start` and open in Expo Go.

## API endpoint table (all except register/login need `Authorization: Bearer <token>`)
| Method | Endpoint | Purpose | Success | Errors |
|---|---|---|---|---|
| POST | /api/auth/register | Register | 201 | 400, 409 |
| POST | /api/auth/login | Login, returns JWT | 200 | 400, 401 |
| GET | /api/auth/me | Current user | 200 | 401 |
| POST | /api/items | Create item (multipart, image) | 201 | 400, 401 |
| GET | /api/items?search=&status=&type= | List items | 200 | 401 |
| GET | /api/items/:id | One item | 200 | 400, 404 |
| PUT | /api/items/:id | Update (reporter only) | 200 | 400, 403, 404 |
| DELETE | /api/items/:id | Delete (reporter only) | 200 | 403, 404 |
| POST | /api/claims | Create claim | 201 | 400, 404, 409 |
| GET | /api/claims/mine | My claim history | 200 | 401 |
| GET | /api/claims/item/:itemId | Claims on my item | 200 | 403, 404 |
| GET | /api/claims/:id | One claim | 200 | 403, 404 |
| PUT | /api/claims/:id | Edit message (Pending only) | 200 | 400, 403, 409 |
| PATCH | /api/claims/:id/status | Approve/Reject (reporter) | 200 | 400, 403, 409 |
| PATCH | /api/claims/:id/cancel | Cancel (claimant) | 200 | 403, 409 |
| DELETE | /api/claims/:id | Delete Rejected/Cancelled claim | 200 | 403, 409 |

## Schema (for the ER diagram)
- **User**: name, email (unique), password (bcrypt hash)
- **Item**: title, description, category, type (Lost/Found), location, image (URL), status (Open/Returned), `reportedBy -> User`
- **Claim**: `item -> Item`, `claimant -> User`, message, status (Pending/Approved/Rejected/Cancelled)
Relationships: User 1-N Item, Item 1-N Claim, User 1-N Claim.

## Report checklist (8-12 pages; you must write this yourself)
Problem statement · architecture diagram (App -> HTTPS -> Express on Render -> Atlas; uploads on server) · schema diagram (above) · endpoint table (above) · deployment walkthrough (section 2 with your screenshots) · one-page reflection (real problems you hit: CORS, Atlas IP whitelist, cold starts, ephemeral uploads, http vs https image URLs...).

## AI declaration (paste into your report, edit to be truthful)
"I used Claude (Anthropic) to generate the initial code for the backend and mobile app of this project. I reviewed, ran, deployed and modified the code, and I can explain it."

## Before you submit
- Get the topic approved by your lecturer first.
- Commit gradually (`git init`, commit each feature as you test it) - a single final commit is a warning sign.
- Test every endpoint in Postman/Thunder Client against the hosted URL, then the app on a real device.
- Read every file. The viva is 60 marks and asks you to explain any line: JWT flow (auth middleware), why `password` has `select:false`, why `decideClaim` uses `updateMany`, how FormData reaches multer, why the token is in SecureStore.
