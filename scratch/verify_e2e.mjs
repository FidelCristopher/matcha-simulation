import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 3099;
const CDP_PORT = 9229;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  // 1. Start server.js on PORT 3099
  const server = spawn('node', ['server.js'], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  await sleep(1000);

  // 2. Start Headless Chrome with CDP
  const userDataDir = path.resolve('scratch/chrome_tmp_' + Date.now());
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--window-size=1366,900',
    '--disable-gpu',
    '--no-sandbox',
    `http://localhost:${PORT}/pages/menu/menu.html`
  ], { stdio: 'ignore' });

  let ws = null;
  let createdOrderId = null;

  try {
    // Wait for CDP endpoint
    let targets = null;
    for (let i = 0; i < 25; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
        const json = await res.json();
        const page = json.find(t => t.type === 'page');
        if (page && page.webSocketDebuggerUrl) {
          targets = page;
          break;
        }
      } catch {}
      await sleep(250);
    }
    if (!targets) throw new Error('Chrome CDP did not become ready');

    ws = new WebSocket(targets.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve);
      ws.addEventListener('error', reject);
    });

    let msgId = 0;
    const pending = new Map();
    const consoleErrors = [];

    ws.addEventListener('message', (ev) => {
      const data = JSON.parse(ev.data);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(new Error(data.error.message));
        else resolve(data.result);
      } else if (data.method === 'Runtime.exceptionThrown') {
        consoleErrors.push(data.params?.exceptionDetails?.text || 'Runtime exception');
      } else if (data.method === 'Console.messageAdded' && data.params?.message?.level === 'error') {
        consoleErrors.push(data.params.message.text);
      }
    });

    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++msgId;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

    const evalJS = async (expression) => {
      const res = await send('Runtime.evaluate', {
        expression,
        awaitPromise: true,
        returnByValue: true
      });
      if (res.exceptionDetails) {
        throw new Error('JS Eval Error: ' + JSON.stringify(res.exceptionDetails));
      }
      return res.result?.value;
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Console.enable');
    await sleep(1200);

    // Dismiss thumbnail screen if visible
    await evalJS(`
      (() => {
        const thumb = document.querySelector('#thumbnail-screen');
        if (thumb && !thumb.classList.contains('hidden')) {
          thumb.click();
        }
      })()
    `);
    await sleep(900);

    // Scroll to menu cards & verify all 5 images loaded cleanly
    const imgStatus = await evalJS(`
      (() => {
        const cards = [...document.querySelectorAll('.pantone-card')];
        if (cards[2]) cards[2].scrollIntoView({ behavior: 'instant', block: 'center' });
        return cards.map(c => {
          const img = c.querySelector('img');
          return {
            id: c.dataset.id,
            complete: img?.complete,
            naturalWidth: img?.naturalWidth,
            naturalHeight: img?.naturalHeight,
            src: img?.currentSrc || img?.src
          };
        });
      })()
    `);
    console.log('Menu card images:', JSON.stringify(imgStatus, null, 2));

    await sleep(500);
    const shotMenu = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/verify_menu_cards.png', Buffer.from(shotMenu.data, 'base64'));

    // Now test Cart + Checkout -> BCA Payment Pop-up Modal!
    // Add an item directly via localStorage / CartManager or UI, then open cart & checkout
    await evalJS(`
      (() => {
        const cart = [{
          id: 'item-verify-1',
          name: 'ICE MATCHA CHOCOLATE',
          spec: 'Regular Ice • Oat Milk',
          price: 28000,
          priceIDR: 28000,
          qty: 2
        }];
        localStorage.setItem('matcha_cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('storage'));
        const btn = document.querySelector('#cart-floating-btn') || document.querySelector('.cart-floating-fab');
        if (btn) btn.click();
      })()
    `);
    await sleep(500);

    // Enter customer name and click Checkout
    await evalJS(`
      (() => {
        const input = document.querySelector('#cart-customer-name');
        if (input) input.value = 'Test Verify Customer';
        const checkoutBtn = document.querySelector('#cart-checkout-btn');
        if (checkoutBtn) checkoutBtn.click();
      })()
    `);
    await sleep(1000);

    // Verify Payment Modal appeared and inspect content
    const modalCheck = await evalJS(`
      (() => {
        const modal = document.querySelector('#payment-modal-backdrop');
        if (!modal) return { exists: false };
        const copyBtn = modal.querySelector('#btn-copy-bca');
        if (copyBtn) copyBtn.click();
        return {
          exists: true,
          active: modal.classList.contains('active'),
          orderId: modal.querySelector('.order-id-code')?.textContent?.trim(),
          customerName: modal.querySelector('.customer-name')?.textContent?.trim(),
          totalPrice: modal.querySelector('.total-price')?.textContent?.trim(),
          accNumber: modal.querySelector('#bca-acc-number')?.textContent?.trim(),
          holderName: modal.querySelector('.account-holder-name')?.textContent?.trim(),
          bankName: modal.querySelector('.bca-bank-name')?.textContent?.trim(),
          copyBtnText: copyBtn?.querySelector('.copy-text')?.textContent?.trim(),
          fullTextIncludes7820722005: modal.textContent.includes('7820722005'),
          fullTextIncludesBCA: modal.textContent.includes('BCA'),
          fullTextIncludesAaron: modal.textContent.includes('Aaron Faustine Suryanto')
        };
      })()
    `);
    console.log('Payment modal verification:', JSON.stringify(modalCheck, null, 2));
    if (modalCheck?.orderId) {
      createdOrderId = modalCheck.orderId.replace('#', '');
    }

    await sleep(400);
    const shotModal = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/verify_payment_modal.png', Buffer.from(shotModal.data, 'base64'));

    // Test closing payment modal via finish button
    await evalJS(`
      (() => {
        const fin = document.querySelector('#payment-finish-btn');
        if (fin) fin.click();
      })()
    `);
    await sleep(450);

    const afterCloseExists = await evalJS(`Boolean(document.querySelector('#payment-modal-backdrop'))`);
    console.log('Modal removed after Finish click:', !afterCloseExists);
    console.log('Console errors:', consoleErrors);

    // Clean up test order from SQLite / JSON backup if created
    if (createdOrderId) {
      try {
        const { DatabaseSync } = await import('node:sqlite');
        const db = new DatabaseSync('data/matcha_cafe.sqlite');
        db.prepare('DELETE FROM orders WHERE id = ?').run(createdOrderId);
        db.close();
        console.log('Cleaned up test order from SQLite:', createdOrderId);
      } catch (e) {
        console.warn('SQLite cleanup note:', e.message);
      }
      try {
        if (fs.existsSync('data/orders_backup.json')) {
          const arr = JSON.parse(fs.readFileSync('data/orders_backup.json', 'utf-8'));
          const filtered = arr.filter(o => o.id !== createdOrderId);
          if (filtered.length !== arr.length) {
            fs.writeFileSync('data/orders_backup.json', JSON.stringify(filtered, null, 2), 'utf-8');
            console.log('Cleaned up test order from orders_backup.json');
          }
        }
      } catch {}
    }
  } finally {
    if (ws) try { ws.close(); } catch {}
    try { chrome.kill(); } catch {}
    try { server.kill(); } catch {}
    await sleep(300);
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch {}
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
