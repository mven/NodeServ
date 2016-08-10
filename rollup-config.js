// if using babel cli
// babel -w -o nodeserv.js index.js
var rollup = require("rollup");
var babel = require("rollup-plugin-babel");

rollup.rollup({
  entry: "src/main.js",
  plugins: [ babel() ]
}).then(function (bundle) {
  bundle.write({
    dest: "dist/bundle.js",
    format: "umd"
  });
});

// if using rollup cli
// rollup -c rollup-config.js
// import babel from 'rollup-plugin-babel';

// export default {
//   entry: 'index.js',
//   plugins: [ babel() ],
//   format: 'umd',
//   dest: 'nodeserv.js'
// };
