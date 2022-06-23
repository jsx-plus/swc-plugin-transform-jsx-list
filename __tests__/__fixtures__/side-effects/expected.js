import { createList as __create_list__ } from "babel-runtime-jsx-plus";
var items = [
    1,
    2,
    3,
    4
];
export default function List() {
    return /*#__PURE__*/ React.createElement("div", null, __create_list__.call(this, items, function(it, idx) {
        return React.createElement("div", null, /*#__PURE__*/ React.createElement("span", null, it));
    }));
};

