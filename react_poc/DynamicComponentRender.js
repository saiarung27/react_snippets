
let apiData = [
  {"cont_seq":1, "st_id": "EN_VIDEO"},
  {"cont_seq":2, "st_id": "EN_ABOUT"},
  {"cont_seq":3, "st_id": "EN_FAQ"},
  {"cont_seq":4, "st_id": "EN_FEEDBACK"}
];

var components = apiData.map(function(elm) {
  var o = Object.assign({}, elm);
  if(elm.st_id === "EN_VIDEO"){
      o.component = 'video';
  }
  if(elm.st_id === "EN_ABOUT"){
    o.component = 'about';
  }
  if(elm.st_id === "EN_FAQ"){
    o.component = 'faq';
  }
  if(elm.st_id === "EN_FEEDBACK"){
    o.component = 'feedback';
  }
  return o;
})
console.log("ooooooooo",components);

const VideoComponent = (props) => {
  return (
    <div id={props.id}>
      <h1>This comp plays some video</h1>
    </div>  
  );
}

const AboutComponent = (props) => {
  return (
    <div id={props.id}>
      <h1>About product</h1>
    </div>  
  );
}

const FaqComponent = (props) => {
  return (
    <div id={props.id}>
      <h1>Any Doubts?</h1>
    </div>  
  );
}

const FeedBackComponent = (props) => {
  return (
    <div id={props.id}>
      <h1>Your feedback is highly appreciated</h1>
    </div>  
  );
}
const KeysToComponentMap = {
  video: VideoComponent,
  about: AboutComponent,
  faq: FaqComponent,
  feedback: FeedBackComponent
};

const RenderComponents = (config) => {
  if (typeof KeysToComponentMap[config.component] !== "undefined") {
    console.log("object val", KeysToComponentMap[config.component]);
    return React.createElement(
      KeysToComponentMap[config.component],
      {id:config.st_id, key: config.cont_seq},
      [])
  }
}

const DynamicComponentRender = () => {
  return(
    <div>
      {components.map(config => RenderComponents(config) )}
    </div>
  );
}

ReactDOM.render(<DynamicComponentRender/>,mountNode)

