const { string, oneOf } = require('prop-types')
const classNames = require('classnames')
const { html } = require('common-tags')
const { withPropTypeChecks } = require('../_utils')
const Container = require('./container.js')

PageTitle.propTypes = {
  title: string.isRequired,
  subtitle: string,
  align: oneOf(['left', 'center', 'right']),
}

function PageTitle (props) {
  const { title, subtitle, align = 'left' } = props
  const alignClass = classNames({
    'text-left': align === 'left',
    'text-center': align === 'center',
    'text-right': align === 'right'
  })
  const content = html`
    <h1 class="font-extrabold text-4xl md:text-5xl leading-tight ${alignClass}">
      ${title}
    </h1>
    ${subtitle && html`
      <p class="mt-2 md:mt-3.5 font-normal text-base sm:text-lg leading-tight text-gray-600 ${alignClass}">
        ${subtitle}
      </p>
    `}
  `
  return Container({
    classes: 'py-8 md:py-16',
    content,
  })
}

module.exports = withPropTypeChecks(PageTitle)
