const HelloWorld = () => {
    const[font, setFont] = useState("");
         
  useEffect(() => {
  const fonts = ["Arial", "Times New Roman", "Helvetica", "Verdana", "monospace"]
  
    function loop(){
     var index = 0;
        setInterval(function(){
            if(index == fonts.length) index = 0;
            setFont(fonts[index]);
            index++
        }, 1000)}
    loop();
    },[]);     
    return (
      <div>  
        <span>Hello</span> <p style={{fontFamily: font }}>World</p> 
      </div>
    );
  }