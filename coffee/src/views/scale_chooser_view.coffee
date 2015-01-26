window.Backbone ||= {}
window.Backbone.Views ||= {}

class Backbone.Views.ScaleChooserView extends Backbone.View
  template: Handlebars.templates['scale_chooser']
  className: 'modal scale-chooser'

  events:
    "click .scales li": "triggerChooseScale"
    "click .back a": "goBack"

  initialize: (options) ->
    @scales = options.scales
    @render()

  render: ->
    @$el.html(@template(
      scales: @scales.toJSON()
      regionName: @getRegionName()
    ))
    @$el.find("[data-toggle=\"popover\"]").popover({ trigger: "hover" })
    return @

  getRegionName: ->
    regionCode = Backbone.history.fragment.split(':')[1]
    regionOptions = MacArthur.CONFIG.regions
    _.find(regionOptions, (o) -> o.code == regionCode).name

  triggerChooseScale: (event) =>
    scaleCode = $(event.target).attr('data-scale-code') or 
      $(event.target).find('.scale-link').attr('data-scale-code')
    Backbone.appRouter.navigate(
      "#{Backbone.history.fragment}/scale:#{scaleCode}", {trigger: true}
    )

  goBack: (e) ->
    e.preventDefault()
    Backbone.appRouter.navigate('/', {trigger: true})

  onClose: ->
    $('.popover[role="tooltip"]').remove()     
