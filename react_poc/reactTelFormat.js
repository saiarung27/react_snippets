
const FormatTelephoneNumber = () => {
    const[phone, setPhone] = useState("");
    const prevPhoneRef = useRef();

  
 function handleChange({ target: { value } }) {   
    const currentValue = value.replace(/[^\d]/g, '');
    const cvLength = currentValue.length;
  
    if (cvLength < 4){
      setPhone(currentValue)
    } 
    if (cvLength < 7){
      setPhone(`(${currentValue.slice(0, 3)}) ${currentValue.slice(3)}`);
    } 
    setPhone( `(${currentValue.slice(0, 3)}) ${currentValue.slice(3, 6)}-${currentValue.slice(6, 10)}`);


  };
  
  return(
    <div>
        <p>Phone:</p>
        <input
          className="input"
          type="text"
          name="phone"
          placeholder="Enter telephone number"
          value={phone}
          onChange={this.handleChange}
        />
      </div>
  );
}
ReactDOM.render(<FormatTelephoneNumber/>, mountNode);