const build = require("./../build/commonjs/index.js");
const FuseBox = build.FuseBox;


const fuseBox = FuseBox.init({
    homeDir: "src",
    outFile: "_playground/react.dom.js",
}).bundle("+react-dom");