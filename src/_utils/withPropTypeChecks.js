const PropTypes = require('prop-types')

/**
 * Checks prop types
 * @param {function} component
 * @param {object} propTypes
 * @return {*} component return
 */
function withPropTypeChecks (component) {
  return (props) => {
    if (component.propTypes) {
      PropTypes.checkPropTypes(
        component.propTypes,
        props,
        'prop',
        component.name
      )
    }
    return component(props)
  }
}

module.exports = withPropTypeChecks
