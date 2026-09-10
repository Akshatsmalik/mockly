import React, { useEffect, useState } from "react";
import { Data } from "./Context";

// Helper: read from sessionStorage with a fallback default
function fromSession(key, defaultValue) {
    try {
        const stored = sessionStorage.getItem(key);
        return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
        return defaultValue;
    }
}

// Helper: write to sessionStorage
function toSession(key, value) {
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
        // sessionStorage full or unavailable — fail silently
    }
}

// Wrapper: useState that syncs with sessionStorage
function useSessionState(key, defaultValue) {
    const [value, setValue] = useState(() => fromSession(key, defaultValue));

    const setAndPersist = (newValue) => {
        setValue((prev) => {
            const resolved = typeof newValue === "function" ? newValue(prev) : newValue;
            toSession(key, resolved);
            return resolved;
        });
    };

    return [value, setAndPersist];
}

function Dataprovider({ children }) {
    const [Data1,       setData1]       = useSessionState("mockly_data1",        "");
    const [round,       setRound]       = useSessionState("mockly_round",        "RESUME");
    const [numq,        setNumq]        = useSessionState("mockly_numq",         1);
    const [domain,      setDomain]      = useSessionState("mockly_domain",       "");
    const [questionc,   setQuestionc]   = useSessionState("mockly_questionc",    0);
    const [results,     setResults]     = useSessionState("mockly_results",      "");
    const [conversation,setConversation]= useSessionState("mockly_conversation", []);
    const [sessions,    setSessions]    = useSessionState("mockly_sessions",     null);
    const [customTopics, setCustomTopics] = useSessionState('mockly_custom_topics', '');

    return (
        <Data.Provider value={{
            Data1,       setData1,
            round,       setRound,
            domain,      setDomain,
            numq,        setNumq,
            questionc,   setQuestionc,
            conversation,setConversation,
            results,     setResults,
            sessions,    setSessions,
            customTopics, setCustomTopics,
        }}>
            {children}
        </Data.Provider>
    );
}

export default Dataprovider;
