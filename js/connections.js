/* js/connections.js — invite helpers shared by auth.html and instructor/index.html.
   clients/index.html does its OWN redemption (redeemPendingInvite, called from loadProfile) —
   it reads the same 'straka-invite' localStorage key this file writes, so don't duplicate that
   logic here. Load this AFTER js/supabase.js. */
(function (w) {
  'use strict';
  var KEY = 'straka-invite';
  var MAX_AGE = 7 * 24 * 60 * 60 * 1000;

  function getPending() {
    try {
      var o = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!o || !o.code) return null;
      if (Date.now() - o.ts > MAX_AGE) { clear(); return null; }
      return o;
    } catch (e) { return null; }
  }
  function clear() { try { localStorage.removeItem(KEY); } catch (e) {} }

  /* Read ?invite=CODE (or ?code=CODE) from the URL and remember it. Call on every auth.html load. */
  function capture() {
    try {
      var p = new URLSearchParams(location.search);
      var code = (p.get('invite') || p.get('code') || '').trim();
      if (code) localStorage.setItem(KEY, JSON.stringify({ code: code, ts: Date.now() }));
    } catch (e) {}
    return getPending();
  }

  /* Public, unauthenticated preview for the "Invited by ..." badge on auth.html. */
  async function preview(sb, code) {
    try {
      var res = await sb.rpc('get_invite_preview', { p_code: code });
      return res.data || { valid: false };
    } catch (e) { return { valid: false }; }
  }

  w.Connections = { capture: capture, getPending: getPending, clear: clear, preview: preview };
})(window);
