import React, { useEffect, useRef, useState } from "react";

/**
 * MatchdayChat
 * ------------
 * Real-time group chat for everyone watching, powered by CometChat's
 * embeddable widget in guest mode — nobody has to sign up to chat.
 *
 * ONE-TIME SETUP (do this before using the component):
 * 1. Create a free account at https://app.cometchat.com
 * 2. Create an App -> copy the App ID, Region, and Auth Key.
 * 3. In the dashboard, go to Groups -> Create Group:
 *      - GUID: wc2026-matchday   (must match GROUP_ID below)
 *      - Type: Public
 * 4. Add to your Vite project's .env (not committed to git):
 *      VITE_COMETCHAT_APP_ID=xxxxx
 *      VITE_COMETCHAT_REGION=us        // or eu / in, whatever your app uses
 *      VITE_COMETCHAT_AUTH_KEY=xxxxx
 */

const GROUP_ID = "wc2026-matchday";
const SCRIPT_SRC = "https://cdn.jsdelivr.net/npm/@cometchat/chat-embed@1.x.x/dist/main.js";

let scriptPromise = null;
function loadCometChatScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.CometChatApp) return resolve();
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export default function MatchdayChat() {
  const bootedRef = useRef(false);
  const [hasCredentials, setHasCredentials] = useState(true);

  useEffect(() => {
    const appID = import.meta.env.VITE_COMETCHAT_APP_ID;
    const region = import.meta.env.VITE_COMETCHAT_REGION;
    const authKey = import.meta.env.VITE_COMETCHAT_AUTH_KEY;

    if (!appID || !region || !authKey) {
      setHasCredentials(false);
      return;
    }

    if (bootedRef.current) return; // guard against double-mount in dev/StrictMode
    bootedRef.current = true;

    loadCometChatScript().then(() => {
      window.CometChatApp.CometChatAuth.start({
        appID,
        region,
        authKey,
        mode: "guest",
        user: { name: `Fan${Math.floor(Math.random() * 10000)}` },

        mount: "#cometChatMount",
        width: "100%",
        height: "480px",
        isDocked: false, // embedded inline, not a floating launcher icon

        chatType: "group",
        defaultChatID: GROUP_ID,
        autoOpenFirstItem: true,
      });
    }).catch((err) => {
      console.error("CometChat failed to load", err);
    });
  }, []);

  if (!hasCredentials) {
    return (
      <div className="rounded-xl overflow-hidden border border-stone-850 bg-[#151619] p-6 text-center space-y-4 shadow-lg">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 mx-auto font-bold text-lg">
          💬
        </div>
        <div>
          <h4 className="font-semibold text-stone-200 text-sm">Real-time CometChat Lobby</h4>
          <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1 leading-normal">
            To enable the live embeddable guest chat, configure your CometChat credentials in your Vite environment variables.
          </p>
        </div>
        <div className="bg-[#0c0d0e] p-3 rounded-lg text-left font-mono text-[10px] text-stone-400 space-y-1 max-w-xs mx-auto border border-stone-850">
          <div># Set in .env file:</div>
          <div>VITE_COMETCHAT_APP_ID=your_id</div>
          <div>VITE_COMETCHAT_REGION=your_region</div>
          <div>VITE_COMETCHAT_AUTH_KEY=your_key</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-stone-850 bg-[#151619] shadow-lg">
      <div className="px-3 py-2 border-b border-stone-850 bg-[#18191c]/60">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
          Matchday chat
        </span>
      </div>
      <div id="cometChatMount" />
    </div>
  );
}
