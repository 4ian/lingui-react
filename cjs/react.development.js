'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _Object$getPrototypeOf = _interopDefault(require('babel-runtime/core-js/object/get-prototype-of'));
var _classCallCheck = _interopDefault(require('babel-runtime/helpers/classCallCheck'));
var _createClass = _interopDefault(require('babel-runtime/helpers/createClass'));
var _possibleConstructorReturn = _interopDefault(require('babel-runtime/helpers/possibleConstructorReturn'));
var _inherits = _interopDefault(require('babel-runtime/helpers/inherits'));
var React = require('react');
var PropTypes = _interopDefault(require('prop-types'));
var hashSum = _interopDefault(require('hash-sum'));
var core = require('@lingui/core');
var _extends = _interopDefault(require('babel-runtime/helpers/extends'));
var hoistStatics = _interopDefault(require('hoist-non-react-statics'));
var _getIterator = _interopDefault(require('babel-runtime/core-js/get-iterator'));
var _slicedToArray = _interopDefault(require('babel-runtime/helpers/slicedToArray'));
var _Object$keys = _interopDefault(require('babel-runtime/core-js/object/keys'));
var _toConsumableArray = _interopDefault(require('babel-runtime/helpers/toConsumableArray'));
var _objectWithoutProperties = _interopDefault(require('babel-runtime/helpers/objectWithoutProperties'));

/*
 * I18nPublisher - Connects to lingui-i18n/I18n class
 * Allows listeners to subscribe for changes
 */
function makeLinguiPublisher(i18n) {
  var subscribers = [];

  return {
    i18n: i18n,
    i18nHash: null,

    getSubscribers: function getSubscribers() {
      return subscribers;
    },
    subscribe: function subscribe(callback) {
      subscribers.push(callback);
    },
    unsubscribe: function unsubscribe(callback) {
      subscribers = subscribers.filter(function (cb) {
        return cb !== callback;
      });
    },
    update: function update() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (!params) return;
      var catalogs = params.catalogs,
          language = params.language,
          locales = params.locales;

      if (!catalogs && !language && !locales) return;

      if (catalogs) i18n.load(catalogs);
      if (language) i18n.activate(language, locales);

      this.i18nHash = hashSum([i18n.language, i18n.messages]);

      subscribers.forEach(function (f) {
        return f();
      });
    }
  };
}

var I18nProvider = function (_React$Component) {
  _inherits(I18nProvider, _React$Component);

  function I18nProvider(props) {
    _classCallCheck(this, I18nProvider);

    var _this = _possibleConstructorReturn(this, (I18nProvider.__proto__ || _Object$getPrototypeOf(I18nProvider)).call(this, props));

    var language = props.language,
        locales = props.locales,
        catalogs = props.catalogs,
        missing = props.missing;

    var i18n = props.i18n || core.setupI18n({
      language: language,
      locales: locales,
      catalogs: catalogs
    });
    _this.linguiPublisher = makeLinguiPublisher(i18n);
    _this.linguiPublisher.i18n._missing = _this.props.missing;
    return _this;
  }

  _createClass(I18nProvider, [{
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var _props = this.props,
          language = _props.language,
          locales = _props.locales,
          catalogs = _props.catalogs;

      if (language !== prevProps.language || locales !== prevProps.locales || catalogs !== prevProps.catalogs) {
        this.linguiPublisher.update({ language: language, catalogs: catalogs, locales: locales });
      }

      this.linguiPublisher.i18n._missing = this.props.missing;
    }
  }, {
    key: "getChildContext",
    value: function getChildContext() {
      return {
        linguiPublisher: this.linguiPublisher,
        linguiDefaultRender: this.props.defaultRender
      };
    }
  }, {
    key: "render",
    value: function render() {
      return this.props.children || null;
    }
  }]);

  return I18nProvider;
}(React.Component);

I18nProvider.defaultProps = {
  defaultRender: null
};
I18nProvider.childContextTypes = {
  linguiPublisher: PropTypes.object.isRequired,
  linguiDefaultRender: PropTypes.any
};

var I18n = function (_React$Component) {
  _inherits(I18n, _React$Component);

  function I18n() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, I18n);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = I18n.__proto__ || _Object$getPrototypeOf(I18n)).call.apply(_ref, [this].concat(args))), _this), _this.checkUpdate = /* istanbul ignore next */function () {
      _this.forceUpdate();
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(I18n, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _getI18n = this.getI18n(),
          subscribe = _getI18n.subscribe;

      if (this.props.update && subscribe) subscribe(this.checkUpdate);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      var _getI18n2 = this.getI18n(),
          unsubscribe = _getI18n2.unsubscribe;

      if (this.props.update && unsubscribe) unsubscribe(this.checkUpdate);
    }

    // Test checks that subscribe/unsubscribe is called with function.

  }, {
    key: "getI18n",
    value: function getI18n() {
      return this.context.linguiPublisher || {};
    }
  }, {
    key: "render",
    value: function render() {
      var _props = this.props,
          children = _props.children,
          withHash = _props.withHash;

      var _getI18n3 = this.getI18n(),
          i18n = _getI18n3.i18n,
          i18nHash = _getI18n3.i18nHash;

      var props = _extends({
        i18n: i18n
      }, withHash ? { i18nHash: i18nHash } : {});

      if (typeof children === "function") {
        return children(props);
      }

      {
        console.warn("I18n accepts only function as a children. " + "Other usecases are deprecated and will be removed in v3.0");
      }

      // Deprecate v3.0
      return React.isValidElement(children) ? React.cloneElement(children, props) : React.createElement(children, props);
    }
  }]);

  return I18n;
}(React.Component);

I18n.defaultProps = {
  update: true,
  withHash: true
};
I18n.contextTypes = {
  linguiPublisher: PropTypes.object
};

var withI18n = function withI18n() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return function (WrappedComponent) {
    {
      if (typeof options === "function" || React.isValidElement(options)) {
        console.warn("withI18n([options]) takes options as a first argument, " + "but received React component itself. Without options, the Component " + "should be wrapped as withI18n()(Component), not withI18n(Component).");
      }
    }

    var _options$update = options.update,
        update = _options$update === undefined ? true : _options$update,
        _options$withHash = options.withHash,
        withHash = _options$withHash === undefined ? true : _options$withHash,
        _options$withRef = options.withRef,
        withRef = _options$withRef === undefined ? false : _options$withRef;

    var WithI18n = function (_React$Component) {
      _inherits(WithI18n, _React$Component);

      function WithI18n() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, WithI18n);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = WithI18n.__proto__ || _Object$getPrototypeOf(WithI18n)).call.apply(_ref, [this].concat(args))), _this), _this.wrappedInstance = null, _this.setWrappedInstance = function (ref) {
          if (withRef) _this.wrappedInstance = ref;
        }, _this.getWrappedInstance = function () {
          if (!withRef) {
            throw new Error("To access the wrapped instance, you need to specify { withRef: true }" + " in the options argument of the withI18n() call.");
          }

          return _this.wrappedInstance;
        }, _temp), _possibleConstructorReturn(_this, _ret);
      }

      _createClass(WithI18n, [{
        key: "render",
        value: function render() {
          var props = _extends({}, this.props, withRef ? { ref: this.setWrappedInstance } : {});
          return React.createElement(
            I18n,
            { update: update, withHash: withHash },
            function (_ref2) {
              var i18n = _ref2.i18n,
                  i18nHash = _ref2.i18nHash;
              return React.createElement(WrappedComponent, _extends({}, props, { i18n: i18n, i18nHash: i18nHash }));
            }
          );
        }
      }]);

      return WithI18n;
    }(React.Component);

    WithI18n.contextTypes = {
      linguiPublisher: PropTypes.object
    };


    return hoistStatics(WithI18n, WrappedComponent);
  };
};

// match <0>paired</0> and <1/> unpaired tags
var tagRe = /<(\d+)>(.*)<\/\1>|<(\d+)\/>/;
var nlRe = /(?:\r\n|\r|\n)/g;

/**
 * `formatElements` - parse string and return tree of react elements
 *
 * `value` is string to be formatted with <0>Paired<0/> or <0/> (unpaired)
 * placeholders. `elements` is a array of react elements which indexes
 * correspond to element indexes in formatted string
 */
function formatElements(value) {
  var elements = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  // TODO: warn if there're any unprocessed elements
  // TODO: warn if element at `index` doesn't exist

  var parts = value.replace(nlRe, "").split(tagRe);

  // no inline elements, return
  if (parts.length === 1) return value;

  var tree = [];

  var before = parts.shift();
  if (before) tree.push(before);

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = _getIterator(getElements(parts)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _ref = _step.value;

      var _ref2 = _slicedToArray(_ref, 3);

      var index = _ref2[0];
      var children = _ref2[1];
      var after = _ref2[2];

      var element = elements[index];
      tree.push(React.cloneElement(element, { key: index },

      // format children for pair tags
      // unpaired tags might have children if it's a component passed as a variable
      children ? formatElements(children, elements) : element.props.children));

      if (after) tree.push(after);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return tree;
}

/*
 * `getElements` - return array of element indexes and element childrens
 *
 * `parts` is array of [pairedIndex, children, unpairedIndex, textAfter, ...]
 * where:
 * - `pairedIndex` is index of paired element (undef for unpaired)
 * - `children` are children of paired element (undef for unpaired)
 * - `unpairedIndex` is index of unpaired element (undef for paired)
 * - `textAfter` is string after all elements (empty string, if there's nothing)
 *
 * `parts` length is always multiply of 4
 *
 * Returns: Array<[elementIndex, children, after]>
 */
function getElements(parts) {
  if (!parts.length) return [];

  var _parts$slice = parts.slice(0, 4),
      _parts$slice2 = _slicedToArray(_parts$slice, 4),
      paired = _parts$slice2[0],
      children = _parts$slice2[1],
      unpaired = _parts$slice2[2],
      after = _parts$slice2[3];

  return [[parseInt(paired || unpaired), children || "", after]].concat(getElements(parts.slice(4, parts.length)));
}

var Render = function (_React$Component) {
  _inherits(Render, _React$Component);

  function Render() {
    _classCallCheck(this, Render);

    return _possibleConstructorReturn(this, (Render.__proto__ || _Object$getPrototypeOf(Render)).apply(this, arguments));
  }

  _createClass(Render, [{
    key: "render",
    value: function render() {
      var _props = this.props,
          className = _props.className,
          value = _props.value;

      var render = this.props.render || this.context.linguiDefaultRender;

      if (render === null || render === undefined) {
        return value || null;
      } else if (typeof render === "string") {
        // Built-in element: h1, p
        return React.createElement(render, { className: className }, value);
      }

      return React.isValidElement(render) ? // Custom element: <p className="lear' />
      React.cloneElement(render, {}, value) : // Custom component: ({ translation }) => <a title={translation}>x</a>
      React.createElement(render, { translation: value });
    }
  }]);

  return Render;
}(React.Component);

Render.contextTypes = {
  linguiDefaultRender: PropTypes.any
};

var Trans = function (_React$Component) {
  _inherits(Trans, _React$Component);

  function Trans() {
    _classCallCheck(this, Trans);

    return _possibleConstructorReturn(this, (Trans.__proto__ || _Object$getPrototypeOf(Trans)).apply(this, arguments));
  }

  _createClass(Trans, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      {
        if (!this.getTranslation() && this.props.children) {
          console.warn("@lingui/babel-preset-react is probably missing in babel config, " + "but you are using <Trans> component in a way which requires it. " + "Either don't use children in <Trans> component or configure babel " + "to load @lingui/babel-preset-react preset. See tutorial for more info: " + "https://l.lingui.io/tutorial-i18n-react");
        }
      }
    }
  }, {
    key: "getTranslation",
    value: function getTranslation() {
      var _props = this.props,
          _props$id = _props.id,
          id = _props$id === undefined ? "" : _props$id,
          defaults = _props.defaults,
          i18n = _props.i18n,
          formats = _props.formats;


      var values = _extends({}, this.props.values);
      var components = this.props.components ? [].concat(_toConsumableArray(this.props.components)) : [];

      if (values) {
        /*
        Related discussion: https://github.com/lingui/js-lingui/issues/183
         Values *might* contain React elements with static content.
        They're replaced with <INDEX /> placeholders and added to `components`.
         Example:
        Translation: Hello {name}
        Values: { name: <strong>Jane</strong> }
         It'll become "Hello <0 />" with components=[<strong>Jane</strong>]
        */

        _Object$keys(values).forEach(function (key) {
          var value = values[key];
          if (!React.isValidElement(value)) return;

          var index = components.push(value) - 1; // push returns new length of array
          values[key] = "<" + index + "/>";
        });
      }

      var translation = i18n && typeof i18n._ === "function" ? i18n._(id, values, { defaults: defaults, formats: formats }) : id; // i18n provider isn't loaded at all
      if (!translation) return null;

      return formatElements(translation, components);
    }
  }, {
    key: "render",
    value: function render() {
      return React.createElement(Render, {
        render: this.props.render,
        className: this.props.className,
        value: this.getTranslation()
      });
    }
  }]);

  return Trans;
}(React.Component);

var Trans$1 = withI18n()(Trans);

var Select = withI18n()(function (_React$Component) {
  _inherits(Select, _React$Component);

  function Select() {
    _classCallCheck(this, Select);

    return _possibleConstructorReturn(this, (Select.__proto__ || _Object$getPrototypeOf(Select)).apply(this, arguments));
  }

  _createClass(Select, [{
    key: "render",
    value: function render() {
      // lingui-transform-js transforms also this file in react-native env.
      // i18n must be aliased to _i18n to hide i18n.select call from plugin,
      // otherwise it throws "undefined is not iterable" obscure error.
      var _props = this.props,
          className = _props.className,
          render = _props.render,
          _i18n = _props.i18n,
          selectProps = _objectWithoutProperties(_props, ["className", "render", "i18n"]);

      return React.createElement(Render, {
        className: className,
        render: render,
        value: _i18n.select(selectProps)
      });
    }
  }]);

  return Select;
}(React.Component));

var PluralFactory = function PluralFactory() {
  var _class2, _temp2;

  var ordinal = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

  var displayName = !ordinal ? "Plural" : "SelectOrdinal";

  return _temp2 = _class2 = function (_React$Component2) {
    _inherits(_class2, _React$Component2);

    function _class2() {
      var _ref;

      var _temp, _this2, _ret;

      _classCallCheck(this, _class2);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this2 = _possibleConstructorReturn(this, (_ref = _class2.__proto__ || _Object$getPrototypeOf(_class2)).call.apply(_ref, [this].concat(args))), _this2), _this2.displayName = displayName, _temp), _possibleConstructorReturn(_this2, _ret);
    }

    _createClass(_class2, [{
      key: "render",
      value: function render() {
        var _props2 = this.props,
            className = _props2.className,
            render = _props2.render,
            i18n = _props2.i18n,
            value = _props2.value,
            offset = _props2.offset,
            props = _objectWithoutProperties(_props2, ["className", "render", "i18n", "value", "offset"]);

        // i18n.selectOrdinal/plural uses numbers for exact matches (1, 2),
        // while SelectOrdinal/Plural has to use strings (_1, _2).


        var pluralProps = _Object$keys(props).reduce(function (acc, prop) {
          var key = prop.replace("_", "");
          acc[key] = props[prop];
          return acc;
        }, {
          value: Number(value),
          offset: Number(offset)
        });

        var translateFunction = !ordinal ? i18n.plural : i18n.selectOrdinal;

        return React.createElement(Render, {
          className: className,
          render: render,
          value: translateFunction(pluralProps)
        });
      }
    }]);

    return _class2;
  }(React.Component), _class2.defaultProps = {
    offset: 0
  }, _temp2;
};

var Plural = withI18n()(PluralFactory(false));
var SelectOrdinal = withI18n()(PluralFactory(true));

function createFormat(formatFunction) {
  return function (_ref) {
    var value = _ref.value,
        format = _ref.format,
        i18n = _ref.i18n,
        className = _ref.className,
        render = _ref.render;

    var formatter = formatFunction(i18n.locales || i18n.language, format);
    return React.createElement(Render, { className: className, render: render, value: formatter(value) });
  };
}

var DateFormat = withI18n()(createFormat(core.date));
var NumberFormat = withI18n()(createFormat(core.number));

var i18nMark = function i18nMark(id) {
  return id;
};

exports.i18nMark = i18nMark;
exports.withI18n = withI18n;
exports.I18nProvider = I18nProvider;
exports.I18n = I18n;
exports.Trans = Trans$1;
exports.Plural = Plural;
exports.Select = Select;
exports.SelectOrdinal = SelectOrdinal;
exports.DateFormat = DateFormat;
exports.NumberFormat = NumberFormat;
