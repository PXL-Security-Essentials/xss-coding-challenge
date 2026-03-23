# XSS Code Challenge

## What is XSS?

Cross-Site Scripting is a security vulnerability where an attacker injects malicious JavaScript into a web page. When another user visits that page, the script runs inside their browser — as if the website itself sent it.

> Think of it like someone sneaking a fake message onto a public whiteboard. Everyone who reads it thinks it's legit.

## Getting Started

Open a terminal window in the IDE (`view`>`terminal`) and run the following commands:

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open your browser at:
http://<challengeIP>:3000
```

You should see a simple Guestbook page with a comment form.

## Add the Comments Feature

Open `server.js`. You will see a `TODO` comment. Replace it with the following 10 lines:

```javascript
const comments = [];

app.post('/comment', (req, res) => {
  const { name, message } = req.body;
  comments.push({ name, message });
  res.redirect('/comments');
});

app.get('/comments', (req, res) => {
  const list = comments.map(c => `<p><strong>${c.name}</strong>: ${c.message}</p>`).join('');
  res.send(`<h1>Comments</h1>${list || '<p>No comments yet.</p>'}<br><a href="/">← Back</a>`);
});
```

Save the file, then restart the server (`Ctrl+C`, then `npm start` again).

---

## Step 2 — Test the Happy Path

1. Go to [http://<challenge-ip>:3000](http://<challenge-ip>:3000)
2. Enter a name, e.g. `Alice`
3. Enter a message, e.g. `Hello world!`
4. Click **Post Comment**
5. You are redirected to `/comments` and see:

   > **Alice**: Hello world!

Everything works as expected.

## iscover the XSS Exploit

Now let's try something different. Go back to the form and submit:

- **Name:** `Hacker`
- **Message:** `<img src=x onerror="alert('XSS!')">`

Click **Post Comment** and visit `/comments`. An alert box pops up! The browser executed JavaScript from a user-submitted comment.

### Why did that happen?

Look at this line in your code:

```javascript
const list = comments.map(c => `<p><strong>${c.name}</strong>: ${c.message}</p>`).join('');
```

You inserted `c.message` directly into HTML. The browser receives:

```html
<p><strong>Hacker</strong>: <img src=x onerror="alert('XSS!')"></p>
```

The browser sees a valid HTML tag and executes the `onerror` event. There is nothing stopping it — you handed the attacker a megaphone inside your page.

In a real app, the payload could steal session cookies, redirect users to a phishing site, or deface the page for every visitor.

## Fix the Vulnerability

The fix is to **escape** user input before inserting it into HTML. Escaping means converting special characters like `<` and `>` into safe text representations (`&lt;` and `&gt;`) that the browser displays as text instead of interpreting as HTML.

Add this helper function near the top of `server.js`, just above the `TODO` block:

```javascript
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```

Then update the `map` line inside `app.get('/comments', ...)` to escape both values:

```javascript
const list = comments.map(c => `<p><strong>${escapeHtml(c.name)}</strong>: ${escapeHtml(c.message)}</p>`).join('');
```

Save and restart the server (`Ctrl+C`, then `npm start`).

### Test the fix

Submit the same XSS payload again:

- **Name:** `Hacker`
- **Message:** `<img src=x onerror="alert('XSS!')">`

Now visit `/comments`. Instead of an alert box, you see the literal text:

> **Hacker**: &lt;img src=x onerror="alert('XSS!')"&gt;

The browser displays it as **plain text** — the attack is neutralized.

### Why does this work?

After escaping, the HTML the server sends looks like this:

```html
<p><strong>Hacker</strong>: &lt;img src=x onerror=&quot;alert('XSS!')&quot;&gt;</p>
```

The browser reads `&lt;` as the *character* `<`, not as the start of an HTML tag. No tag, no event, no script.
