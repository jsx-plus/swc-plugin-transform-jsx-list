import { createList as __create_list__ } from "babel-runtime-jsx-plus";
import { createElement } from "react";
function Foo() {
    return /*#__PURE__*/ React.createElement(View, null, __create_list__.call(this, array, function() {
        return React.createElement(View, null, "hello");
    }), __create_list__.call(this, array, function(item) {
        return React.createElement(View, null, "item: ", item);
    }), __create_list__.call(this, foo, function(item, key) {
        return React.createElement(View, null, "key: ", key, ", item: ", item);
    }), __create_list__.call(this, exp(), function(item, key) {
        return React.createElement(View, null, "key: ", key, ", item: ", item);
    }));
}

