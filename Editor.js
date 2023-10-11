import React, { useEffect, useState, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
//import 'codemirror/theme/dracula.css';
import 'codemirror/theme/isotope.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';
import Axios from 'axios';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { Button } from 'bootstrap';



const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const editorRef = useRef(null);

     const [code, setCode] = useState("");
    const [output, setOutput] = useState("");
    

    useEffect(() => {
        

        async function init() {
          editorRef.current = Codemirror.fromTextArea(
                document.getElementById('realtimeEditor'),
                {
                    mode: { name: 'javascript', json: true },
                    mode: { name: 'python', json: true },
                    theme: 'isotope',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,

                }
            );

            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });
                }
            });
            
        }
        init();
    }, []);
    

    const handleSubmit = async () => {
        const payload = {
          language: "cpp",
          code,
        };

        try {
        const { data } = await Axios.post("http://localhost:5000/run", payload)
        setOutput(data.output);
        } catch (err) {
          console.log(err.response);
        }
      };

       async function copyCode() {
        try {
            await navigator.clipboard.writeText(editorRef.current.getValue());
            toast.success('Code has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Code');
            console.error(err);
        }
    }

      

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null) {
                    editorRef.current.setValue(code);
                }
            });
        }

         return () => {
             socketRef.current.off(ACTIONS.CODE_CHANGE);
         };
    }, [socketRef.current]);

    return <div>
        <div className='copyHeader'>
            <button className="copyCode" onClick={copyCode}>Copy Code</button>
        </div>
        <div>
    <textarea id="realtimeEditor" value={code} onChange={(e)=>{setCode(e.target.value)}} rows="20" cols="75"></textarea>
    </div>
    </div>;
};

export default Editor;