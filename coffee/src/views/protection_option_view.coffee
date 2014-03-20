window.Backbone ||= {}
window.Backbone.Views ||= {}

class Backbone.Views.ProtectionOptionView extends Backbone.Diorama.NestingView
  template: Handlebars.templates['protection_option']

  events:
    'change [type="checkbox"]': "setProtection"

  initialize: (options) ->
    @filter = options.filter
    @protection = @filter.get('protection')
    @render()

  render: ->
    @$el.html(@template(
      thisView: @
      filter: @filter
      protection: !!@protection
    ))
    @attachSubViews()
    return @

  setProtection: (event) ->
    @filter.set('protection', $(event.target).is(':checked'))
    @unsetProtectionLevel()

  unsetProtectionLevel: ->
    if @filter.get('protection') == no
      @filter.unset('protectionLevel')

  onClose: ->
    @closeSubViews()
    @stopListening()
