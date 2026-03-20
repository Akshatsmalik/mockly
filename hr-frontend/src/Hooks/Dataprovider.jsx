import React,{useState} from "react";
import { Data } from "./Context";

function Dataprovider({children}){
    const [Data1,setData1] = useState("")
    const [round,setRound] = useState("RESUME")
    const [numq,setNumq]=useState(1)
    const [domain,setDomain]=useState('')
    const [questionc,setQuestionc]=useState(0)
    const [results, setResults]=useState('')
    const [conversation, setConversation]=useState([])  
    const [sessions, setSessions] = useState(null);
    
    return(
        <Data.Provider value={{
        Data1,setData1,
        round,setRound,
        domain,setDomain,
        numq,setNumq,
        questionc,setQuestionc,
        conversation,setConversation,
        results,setResults,
        sessions,setSessions
      }}>
        
            {children}
        </Data.Provider>
    )
}

export default Dataprovider
