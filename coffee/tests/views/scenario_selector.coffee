suite 'Scenario View'

test('in the Future Threats tab, if the subject filter is set, and a scenario
 is selected, the filter should be set accordingly', ->

  selector = MacArthur.CONFIG.scenarios['broadscale'][1].selector
  regions = new Backbone.Collections.RegionCollection MacArthur.CONFIG.regions
  filter = new Backbone.Models.Filter()
  scales = new Backbone.Collections.ScaleCollection MacArthur.CONFIG.scales
  filter.set('scale', scales.models[0])
  filter.set('region', regions.models[0])

  scenarioView = new Backbone.Views.ScenarioSelectorView( filter: filter )
  
  filter.set('tab', 'future_threats')
  filter.set('subject', 'biodiversity')

  scenarioView.$el.find("#scenario-select option[value='#{selector}']")
    .prop('selected', true)
  scenarioView.$el.find("#scenario-select").trigger('change')

  assert.strictEqual( filter.get('scenario'), selector)

)

test('in the Change tab, if the subject filter is set, and a scenario
 is selected, the filter should be set accordingly', ->

  selector = MacArthur.CONFIG.scenarios['regional']['WAN'][1].selector
  regions = new Backbone.Collections.RegionCollection MacArthur.CONFIG.regions
  filter = new Backbone.Models.Filter()
  scales = new Backbone.Collections.ScaleCollection MacArthur.CONFIG.scales
  filter.set('scale', scales.models[1])
  filter.set('region', regions.models[0])

  scenarioView = new Backbone.Views.ScenarioSelectorView( filter: filter )

  filter.set('tab', 'change')
  filter.set('subject', 'biodiversity')

  scenarioView.$el.find("#scenario-select option[value='#{selector}']")
    .prop('selected', true)
  scenarioView.$el.find("#scenario-select").trigger('change')

  assert.strictEqual( filter.get('scenario'), selector)

)