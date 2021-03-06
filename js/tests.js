(function() {
  suite("Query Builder integration");

  test("When a filter model has its attributes changed, the 'query' attribute is updated and change:query event is fired", function() {
    var changeQuerySpy, filter, newQuery, oldQuery, queryBuilder, updatedQuery;
    filter = new Backbone.Models.Filter();
    queryBuilder = new MacArthur.QueryBuilder(filter);
    oldQuery = filter.get('query');
    changeQuerySpy = sinon.spy();
    filter.on('change:query', changeQuerySpy);
    newQuery = "SELECT BLAH BLAH BVLAH";
    sinon.stub(queryBuilder, 'buildQuery', function() {
      return newQuery;
    });
    filter.set('subject', MacArthur.CONFIG.subjects[0].selector);
    updatedQuery = filter.get('query');
    assert.notEqual(updatedQuery, oldQuery, "Expected filter.query to be modified");
    assert.strictEqual(updatedQuery, newQuery, "Expected filter.query set to the result of QueryBuilder.buildQuery");
    return assert.isTrue(changeQuerySpy.calledOnce, "Expected filter to fire a change:query event once, but fired " + changeQuerySpy.callCount + " times");
  });

}).call(this);

(function() {
  suite('Main Controller');

  test('The application starts by showing the choose region view and a map', function() {
    var controller, showMapActionStub;
    showMapActionStub = sinon.stub(Backbone.Controllers.MainController.prototype, "showMap", function() {});
    controller = new Backbone.Controllers.MainController();
    try {
      return assert.isTrue(showMapActionStub.calledOnce, "Expected the showMap action to be called");
    } finally {
      showMapActionStub.restore();
    }
  });

}).call(this);

(function() {
  suite("QueryBuilder");

  test("When initialized it takes a Filter instance and stores it as an attribute", function() {
    var filter, queryBuilder;
    filter = new Backbone.Models.Filter();
    queryBuilder = new window.MacArthur.QueryBuilder(filter);
    assert.property(queryBuilder, 'filter');
    return assert.strictEqual(queryBuilder.filter.cid, filter.cid, "Expected filter attribute to be equal to the filter passed to the constructor");
  });

  test("When the Filter changes, buildQuery is called only once", function() {
    var buildQueryStub, count, filter, queryBuilder;
    count = 0;
    filter = new Backbone.Models.Filter();
    queryBuilder = new window.MacArthur.QueryBuilder(filter);
    buildQueryStub = sinon.stub(queryBuilder, 'buildQuery', function() {
      if (count < 5) {
        count += 1;
      }
      return 'foo';
    });
    filter.set('subject', 'xxx');
    return assert.strictEqual(buildQueryStub.callCount, 1, "Expected filter attribute to be called once");
  });

  test(".updateFilterQuery updates the filter.query with the return value of buildQuery", function() {
    var buildQueryResult, buildQueryStub, filter, queryBuilder;
    filter = new Backbone.Models.Filter();
    queryBuilder = new window.MacArthur.QueryBuilder(filter);
    buildQueryResult = "FooBar";
    buildQueryStub = sinon.stub(queryBuilder, 'buildQuery', function() {
      return buildQueryResult;
    });
    filter.set('subject', 'xxx');
    return assert.strictEqual(filter.get('query'), buildQueryResult, "Expected the filter.query attribute to be updated");
  });

  test('.buildSubjectClause constructs an SQL clause for filter.subject', function() {
    var filter, query, queryBuiler;
    filter = new Backbone.Models.Filter({
      subject: MacArthur.CONFIG.subjects[0].selector
    });
    queryBuiler = new MacArthur.QueryBuilder(filter);
    query = queryBuiler.buildSubjectClause();
    return assert.strictEqual(query, "lens.name = 'bd' ");
  });

  test('.buildSubjectClause with no subject set throws an error', function() {
    var filter, queryBuiler;
    filter = new Backbone.Models.Filter();
    queryBuiler = new MacArthur.QueryBuilder(filter);
    return assert.throws((function() {
      return queryBuiler.buildSubjectClause();
    }), "Error building query, unknown subject 'undefined'");
  });

  test('.buildSubjectClause with unknown subject throws an error', function() {
    var filter, queryBuiler;
    filter = new Backbone.Models.Filter({
      subject: 'wofjefhsdjkgh'
    });
    queryBuiler = new MacArthur.QueryBuilder(filter);
    return assert.throws((function() {
      return queryBuiler.buildSubjectClause();
    }), "Error building query, unknown subject '" + (filter.get('subject')) + "'");
  });

  test('.buildLensClause constructs an SQL clause for filter.lens', function() {
    var filter, query, queryBuiler;
    filter = new Backbone.Models.Filter({
      subject: MacArthur.CONFIG.subjects[1].selector,
      lens: MacArthur.CONFIG.lenses.ecosystem[0].selector
    });
    queryBuiler = new MacArthur.QueryBuilder(filter);
    query = queryBuiler.buildLensClause();
    return assert.strictEqual(query, "lens.type = 'totef' ");
  });

  test('.buildLensClause when no lens is specified sets the default to all species');

  test('if the filter lens is set with the wrong subject, hasRequiredFilters returns false', function() {
    var filter, query, queryBuiler;
    filter = new Backbone.Models.Filter({
      subject: MacArthur.CONFIG.subjects[1].selector,
      lens: MacArthur.CONFIG.lenses.biodiversity[0].selector
    });
    queryBuiler = new MacArthur.QueryBuilder(filter);
    query = queryBuiler.buildLensClause();
    return assert.isFalse(queryBuiler.hasRequiredFilters());
  });

  test('if the filter lens is set with the correct subject, hasRequiredFilters returns true', function() {
    var filter, query, queryBuiler;
    filter = new Backbone.Models.Filter({
      subject: MacArthur.CONFIG.subjects[1].selector,
      lens: MacArthur.CONFIG.lenses.ecosystem[0].selector
    });
    queryBuiler = new MacArthur.QueryBuilder(filter);
    query = queryBuiler.buildLensClause();
    return assert.isTrue(queryBuiler.hasRequiredFilters());
  });

  test('if the tab is set to `change` and the filter lens is set, but the scenario is not, hasRequiredFilters still returns true', function() {
    var filter, queryBuiler;
    filter = new Backbone.Models.Filter({
      subject: MacArthur.CONFIG.subjects[1].selector,
      lens: MacArthur.CONFIG.lenses.ecosystem[0].selector,
      tab: 'change'
    });
    queryBuiler = new MacArthur.QueryBuilder(filter);
    return assert.isTrue(queryBuiler.hasRequiredFilters());
  });

  test('if the tab is set to `change` and the filter lens is set, but the scenario is not, `buildQuery` should not be called', function() {
    var buildQuerySpy, filter, queryBuiler;
    filter = new Backbone.Models.Filter({
      subject: MacArthur.CONFIG.subjects[1].selector,
      lens: MacArthur.CONFIG.lenses.ecosystem[0].selector,
      tab: 'change'
    });
    buildQuerySpy = sinon.spy(MacArthur.QueryBuilder.prototype, 'buildQuery');
    queryBuiler = new MacArthur.QueryBuilder(filter);
    queryBuiler.updateFilterQuery();
    try {
      return assert.strictEqual(buildQuerySpy.callCount, 0, "Expected the buildQuery not to be called");
    } finally {
      buildQuerySpy.restore();
    }
  });

  test('if the tab is set to `future_threats` and the subject is set, `buildQuery` should be called', function() {
    var buildQuerySpy, config, filter, queryBuiler, regions, resultsNumberRenderStub, scales, tabView;
    resultsNumberRenderStub = sinon.stub(Backbone.Views.ResultsNumberView.prototype, 'initialize', function() {});
    config = MacArthur.CONFIG;
    regions = new Backbone.Collections.RegionCollection(config.regions);
    scales = new Backbone.Collections.ScaleCollection(MacArthur.CONFIG.scales);
    filter = new Backbone.Models.Filter({
      region: regions.models[0],
      scale: scales.models[0],
      tab: 'future_threats',
      subject: config.subjects[0].selector,
      agrCommDevLevel: config.agrCommDevLevels[0].selector,
      lens: config.lenses[config.subjects[1].selector][0].selector,
      level: config.levels["default"][0].selector
    });
    buildQuerySpy = sinon.spy(MacArthur.QueryBuilder.prototype, 'buildQuery');
    queryBuiler = new MacArthur.QueryBuilder(filter);
    tabView = new Backbone.Views.TabView({
      filter: filter
    });
    filter.set('subject', config.subjects[1].selector);
    try {
      assert.strictEqual(buildQuerySpy.callCount, 1, "Expected the buildQuery to be called after updateFilterQuery");
    } finally {
      buildQuerySpy.restore();
    }
    return resultsNumberRenderStub.restore();
  });

}).call(this);

(function() {
  suite('Filter View');

  test('presents a choice between biodiversity and ecosystem subjects', function() {
    var resultsNumberRenderStub, view;
    resultsNumberRenderStub = sinon.stub(Backbone.Views.ResultsNumberView.prototype, 'initialize', function() {});
    view = new Backbone.Views.FilterView({
      filter: new Backbone.Models.Filter()
    });
    assert.match(view.$el.find('.subjects').text(), new RegExp('.*Biodiversity.*'));
    assert.match(view.$el.find('.subjects').text(), new RegExp('.*Ecosystem.*'));
    return resultsNumberRenderStub.restore();
  });

  test('when a subject is selected the filter object is updated', function() {
    var filter, resultsNumberRenderStub, subjectElement, view;
    resultsNumberRenderStub = sinon.stub(Backbone.Views.ResultsNumberView.prototype, 'initialize', function() {});
    filter = new Backbone.Models.Filter();
    view = new Backbone.Views.FilterView({
      filter: filter
    });
    subjectElement = view.$el.find('.subjects [data-subject="biodiversity"]');
    subjectElement.trigger('click');
    assert.strictEqual(filter.get('subject'), 'biodiversity', 'Expected the filter model subject attribute to be biodiversity');
    return resultsNumberRenderStub.restore();
  });

  test('if the filter has a subject, render creates a LensSelector subview with that filter', function() {
    var LensSelectorConstructorSpy, filter, filterView, lensSelectorArgs, resultsNumberRenderStub;
    resultsNumberRenderStub = sinon.stub(Backbone.Views.ResultsNumberView.prototype, 'initialize', function() {});
    LensSelectorConstructorSpy = sinon.spy(Backbone.Views, 'LensSelectorView');
    filter = new Backbone.Models.Filter({
      subject: 'biodiversity'
    });
    filterView = new Backbone.Views.FilterView({
      filter: filter
    });
    try {
      assert.isTrue(LensSelectorConstructorSpy.callCount > 0, "Expected a new LensSelectorView to be created");
      lensSelectorArgs = LensSelectorConstructorSpy.getCall(0).args;
      assert.deepEqual(lensSelectorArgs[0].filter, filter, "Expected the LensSelectorView to be created with the biodiversity lenses");
    } finally {
      LensSelectorConstructorSpy.restore();
    }
    return resultsNumberRenderStub.restore();
  });

  test('if the filter does not have a subject set, no LensSelector subview is created', function() {
    var LensSelectorConstructorSpy, filter, filterView, resultsNumberRenderStub;
    resultsNumberRenderStub = sinon.stub(Backbone.Views.ResultsNumberView.prototype, 'initialize', function() {});
    LensSelectorConstructorSpy = sinon.spy(Backbone.Views, 'LensSelectorView');
    filter = new Backbone.Models.Filter();
    filterView = new Backbone.Views.FilterView({
      filter: filter
    });
    try {
      assert.strictEqual(LensSelectorConstructorSpy.callCount, 0, "Expected a new LensSelectorView not to be created");
    } finally {
      LensSelectorConstructorSpy.restore();
    }
    return resultsNumberRenderStub.restore();
  });

  test('in the change tab, if the subject filter is set, but not the scenario, no LensSelector subview is created', function() {
    var LensSelectorConstructorSpy, filter, filterView, resultsNumberRenderStub, scales;
    resultsNumberRenderStub = sinon.stub(Backbone.Views.ResultsNumberView.prototype, 'initialize', function() {});
    LensSelectorConstructorSpy = sinon.spy(Backbone.Views, 'LensSelectorView');
    filter = new Backbone.Models.Filter();
    filter.set('scale', 'broadscale');
    filterView = new Backbone.Views.FilterView({
      filter: filter
    });
    filter.set('tab', 'change');
    scales = new Backbone.Collections.ScaleCollection(MacArthur.CONFIG.scales);
    filter.set('scale', scales.models[0]);
    try {
      assert.strictEqual(LensSelectorConstructorSpy.callCount, 0, "Expected a new LensSelectorView not to be created");
    } finally {
      LensSelectorConstructorSpy.restore();
    }
    return resultsNumberRenderStub.restore();
  });

}).call(this);

(function() {
  suite("LensSelector View");

  test('when the filter has a subject set, it renders the corresponding lenses', function() {
    var biodiversityLenses, dataSelectionBio, dataSelectionEco, ecosystemLenses, filter, lensSelectorView;
    filter = new Backbone.Models.Filter({
      subject: 'biodiversity'
    });
    lensSelectorView = new Backbone.Views.LensSelectorView({
      filter: filter
    });
    ecosystemLenses = MacArthur.CONFIG.lenses.ecosystem;
    dataSelectionEco = lensSelectorView.$el.find('select option[value="comprov"]');
    biodiversityLenses = MacArthur.CONFIG.lenses.biodiversity;
    dataSelectionBio = lensSelectorView.$el.find('select option[value="amphibia"]');
    assert.lengthOf(dataSelectionEco, 0, "Expected the LensSelectorView not to contain the ecosystem lenses");
    return assert.lengthOf(dataSelectionBio, 1, "Expected the LensSelectorView to contain the biodiversity lenses");
  });

  test('when the lenses view is initialized the default lens for the filter subject is set on the filter', function() {
    var changeSpy, filter, lensSelectorView;
    filter = new Backbone.Models.Filter({
      subject: 'biodiversity'
    });
    changeSpy = sinon.spy();
    filter.on('change:lens', changeSpy);
    lensSelectorView = new Backbone.Views.LensSelectorView({
      filter: filter
    });
    assert.strictEqual(filter.get('lens'), 'allsp', "Expected lens to be allsp");
    return assert.strictEqual(changeSpy.callCount, 1);
  });

  test('it shows the current lens selected', function() {
    var filter, lensSelectorView, selection;
    filter = new Backbone.Models.Filter({
      subject: 'biodiversity',
      lens: 'amphibia'
    });
    lensSelectorView = new Backbone.Views.LensSelectorView({
      filter: filter
    });
    selection = lensSelectorView.$el.find('select').find(":selected").attr('value');
    return assert.strictEqual(selection, 'amphibia', "Expected selection value to match the filter lens attribute");
  });

}).call(this);

(function() {
  suite("LevelSelector View");

  test('when the filter has a subject set, it renders the corresponding levels', function() {
    var dataSelectionHigh, filter, levelSelectorView;
    filter = new Backbone.Models.Filter({
      subject: 'biodiversity'
    });
    levelSelectorView = new Backbone.Views.LevelSelectorView({
      filter: filter
    });
    dataSelectionHigh = levelSelectorView.$el.find('select option[value="high"]');
    return assert.lengthOf(dataSelectionHigh, 1, "Expected the levelSelectorView to contain the high level");
  });

  test('when the level view is initialized the default level for the filter subject is set on the filter', function() {
    var changeSpy, filter, levelSelectorView;
    filter = new Backbone.Models.Filter({
      subject: 'biodiversity'
    });
    changeSpy = sinon.spy();
    filter.on('change:level', changeSpy);
    levelSelectorView = new Backbone.Views.LevelSelectorView({
      filter: filter
    });
    assert.strictEqual(filter.get('level'), 'all', "Expected level to be high");
    return assert.strictEqual(changeSpy.callCount, 1);
  });

  test('it shows the current level selected', function() {
    var filter, levelSelectorView, selection;
    filter = new Backbone.Models.Filter({
      subject: 'biodiversity',
      level: 'medium'
    });
    levelSelectorView = new Backbone.Views.LevelSelectorView({
      filter: filter
    });
    selection = levelSelectorView.$el.find('select').find(":selected").attr('value');
    return assert.strictEqual(selection, 'medium', "Expected selection value to match the filter level attribute");
  });

  test('Level selector should show `all` selected when `all` is selected', function() {
    var filter, levelSelectorView;
    filter = new Backbone.Models.Filter({
      level: 'low'
    });
    levelSelectorView = new Backbone.Views.LevelSelectorView({
      filter: filter
    });
    levelSelectorView.$el.find("select").val('all');
    levelSelectorView.$el.find("select").trigger('change');
    assert.strictEqual(filter.get('level'), 'all', "Expected filter level to be equal to 'all'");
    assert.strictEqual(levelSelectorView.$el.find("select").val(), 'all', "Expected selected option to be equal to 'all'");
    return assert.strictEqual(levelSelectorView.$el.find('[selected]').length, 1, "Expected only one <option> to have the 'selected' attribute");
  });

}).call(this);

(function() {
  suite('Map View');

  test('When the filter query attribute changes, updateQueryLayer is called', function() {
    var filter, initBaseLayerStub, mapView, updateQueryLayerStub;
    initBaseLayerStub = sinon.stub(Backbone.Views.MapView.prototype, 'initBaseLayer', function() {});
    updateQueryLayerStub = sinon.stub(Backbone.Views.MapView.prototype, 'updateQueryLayer', function() {});
    filter = new Backbone.Models.Filter();
    mapView = new Backbone.Views.MapView({
      filter: filter
    });
    filter.set('query', 'my query');
    try {
      return assert.strictEqual(updateQueryLayerStub.callCount, 1, "expected updateQueryLayer to be called once");
    } finally {
      initBaseLayerStub.restore();
      updateQueryLayerStub.restore();
    }
  });

  test('.buildQuerydata should return an object with keys as watershed_ids and values as other objects with value and protection_percentage', function() {
    var filter, initBaseLayerStub, mapView, querydata, rows;
    initBaseLayerStub = sinon.stub(Backbone.Views.MapView.prototype, 'initBaseLayer', function() {});
    rows = [
      {
        watershed_id: 2805,
        value: 8.6066515929,
        protection_percentage: 59.1202577939
      }, {
        watershed_id: 2814,
        value: 106.4846311487,
        protection_percentage: 26.6124303217
      }, {
        watershed_id: 2815,
        value: 33.0610034886,
        protection_percentage: 18.2542237936
      }
    ];
    filter = new Backbone.Models.Filter();
    mapView = new Backbone.Views.MapView({
      filter: filter
    });
    querydata = mapView.buildQuerydata(rows);
    return assert.strictEqual(querydata[2805].protectionPercentage, 59.1202577939);
  });

}).call(this);

(function() {
  suite("ProtectionOption View");

  test('when the filter has a subject set, it renders the protection option', function() {
    var filter, protectionOptionView, protectionSelectorView, selection;
    filter = new Backbone.Models.Filter({
      subject: 'biodiversity',
      protection: false
    });
    protectionOptionView = new Backbone.Views.ProtectionOptionView({
      filter: filter
    });
    protectionSelectorView = new Backbone.Views.ProtectionSelectorView({
      filter: filter
    });
    selection = protectionOptionView.$el.find('input:checkbox');
    return assert.lengthOf(selection, 1, "Expected the protection checkbox button to be present");
  });

  test('when the checkbox button is checked, the protection filter is set to true', function() {
    var filter, protection, protectionOptionView, protectionSelectorView, setProtectionSpy;
    filter = new Backbone.Models.Filter({
      subject: 'biodiversity',
      protection: false
    });
    protectionOptionView = new Backbone.Views.ProtectionOptionView({
      filter: filter
    });
    protectionSelectorView = new Backbone.Views.ProtectionSelectorView({
      filter: filter
    });
    setProtectionSpy = sinon.spy(Backbone.Views.ProtectionOptionView.prototype, 'setProtection');
    protectionOptionView = new Backbone.Views.ProtectionOptionView({
      filter: filter
    });
    protectionOptionView.$el.find("[type='checkbox']").attr('checked', true);
    protectionOptionView.$el.find("[type='checkbox']").trigger('change');
    protection = filter.get('protection');
    try {
      assert.strictEqual(setProtectionSpy.callCount, 1, "Expected setProtection to be called");
      return assert.isTrue(protection, "Expected the protection filter attribute to be true");
    } finally {
      setProtectionSpy.restore();
    }
  });

  test('when the filter has protection set to true, the protection option is checked', function() {
    var filter, protectionOptionView, protectionSelectorView, selection;
    filter = new Backbone.Models.Filter({
      subject: 'biodiversity',
      protection: false
    });
    protectionOptionView = new Backbone.Views.ProtectionOptionView({
      filter: filter
    });
    protectionSelectorView = new Backbone.Views.ProtectionSelectorView({
      filter: filter
    });
    filter.set('protection', true);
    selection = protectionOptionView.$el.find('input:checkbox').val();
    return assert.equal(selection, 'on', "Expected the protection checkbox button to be checked");
  });

  test('when the filter has protection set to true, the protection selector is visible and populated with options', function() {
    var filter, protectionOptionView, protectionSelectorView, selection;
    filter = new Backbone.Models.Filter({
      subject: 'biodiversity',
      protection: false
    });
    protectionOptionView = new Backbone.Views.ProtectionOptionView({
      filter: filter
    });
    protectionSelectorView = new Backbone.Views.ProtectionSelectorView({
      filter: filter
    });
    filter.set('protection', true);
    selection = protectionSelectorView.$el.find('select');
    assert.lengthOf(selection, 1, "Expected the protection select to be visible");
    return assert.lengthOf(selection.find('option'), 3, "Expected the dropdown to have 3 selections: high, medium, low");
  });

  test('when the filter has protection set to true, the query on the selector object is NOT updated', function() {
    var buildQuerySpy, filter, protectionOptionView, protectionSelectorView, queryBuilder, regions, scales;
    filter = new Backbone.Models.Filter({
      subject: 'biodiversity',
      protection: false
    });
    protectionOptionView = new Backbone.Views.ProtectionOptionView({
      filter: filter
    });
    protectionSelectorView = new Backbone.Views.ProtectionSelectorView({
      filter: filter
    });
    regions = new Backbone.Collections.RegionCollection(MacArthur.CONFIG.regions);
    scales = new Backbone.Collections.ScaleCollection(MacArthur.CONFIG.scales);
    filter.set('region', regions.models[0]);
    filter.set('scale', scales.models[0]);
    filter.set('lens', 'allsp');
    buildQuerySpy = sinon.spy(MacArthur.QueryBuilder.prototype, 'buildQuery');
    queryBuilder = new MacArthur.QueryBuilder(filter);
    filter.set('protection', true);
    return assert.strictEqual(buildQuerySpy.callCount, 0, "Expected the buildQuery method not to be called");
  });

  test('when the filter has protection set to false, the protection_level is unset on the selector object', function() {
    var defaultProtectionLevel, filter, protectionOptionView, protectionSelectorView;
    filter = new Backbone.Models.Filter({
      subject: 'biodiversity',
      protection: false
    });
    protectionOptionView = new Backbone.Views.ProtectionOptionView({
      filter: filter
    });
    protectionSelectorView = new Backbone.Views.ProtectionSelectorView({
      filter: filter
    });
    defaultProtectionLevel = _.find(MacArthur.CONFIG.protectionLevels, function(pl) {
      return pl["default"] === true;
    }).selector;
    filter.set('protection', true);
    filter.set('protectionLevel', defaultProtectionLevel);
    protectionOptionView.$el.find("[type='checkbox']").attr('checked', false);
    protectionOptionView.$el.find("[type='checkbox']").trigger('change');
    return assert.isUndefined(filter.get('protection_level'), "Expected the protection_level filter to be undefined");
  });

}).call(this);

(function() {
  suite('Region Chooser View');

  test('.render presents a list of the three regions', function() {
    var regions, view;
    regions = new Backbone.Collections.RegionCollection(MacArthur.CONFIG.regions);
    view = new Backbone.Views.RegionChooserView({
      regions: regions
    });
    assert.strictEqual(view.$el.find(".regions .region-area.region-link[data-region-code='WAN']").text(), "Andes");
    assert.strictEqual(view.$el.find(".regions .region-area.region-link[data-region-code='GLR']").text(), "African Great Lakes");
    return assert.strictEqual(view.$el.find(".regions .region-area.region-link[data-region-code='MEK']").text(), "Mekong");
  });

}).call(this);

(function() {
  suite('Results number View');

  test('When the Result model is updated the view is re-rendered and the result displayed', function() {
    var resultsNumber, resultsNumberRenderSpy, resultsNumberView;
    resultsNumberRenderSpy = sinon.spy(Backbone.Views.ResultsNumberView.prototype, 'render');
    resultsNumber = new Backbone.Models.ResultsNumber({
      number: 10
    });
    resultsNumberView = new Backbone.Views.ResultsNumberView({
      resultsNumber: resultsNumber
    });
    resultsNumber.set('number', 20);
    try {
      return assert.strictEqual(resultsNumberRenderSpy.callCount, 2, "Expected the resultsNumberView to be called twice");
    } finally {
      resultsNumberRenderSpy.restore();
    }
  });

}).call(this);

(function() {
  suite('Scale Chooser View');

}).call(this);

(function() {
  suite('Scenario View');

  test('in the Future Threats tab, if the subject filter is set, and a scenario is selected, the filter should be set accordingly', function() {
    var filter, regions, scales, scenarioView, selector;
    selector = MacArthur.CONFIG.scenarios['broadscale'][1].selector;
    regions = new Backbone.Collections.RegionCollection(MacArthur.CONFIG.regions);
    filter = new Backbone.Models.Filter();
    scales = new Backbone.Collections.ScaleCollection(MacArthur.CONFIG.scales);
    filter.set('scale', scales.models[0]);
    filter.set('region', regions.models[0]);
    scenarioView = new Backbone.Views.ScenarioSelectorView({
      filter: filter
    });
    filter.set('tab', 'future_threats');
    filter.set('subject', 'biodiversity');
    scenarioView.$el.find("#scenario-select option[value='" + selector + "']").prop('selected', true);
    scenarioView.$el.find("#scenario-select").trigger('change');
    return assert.strictEqual(filter.get('scenario'), selector);
  });

  test('in the Change tab, if the subject filter is set, and a scenario is selected, the filter should be set accordingly', function() {
    var filter, regions, scales, scenarioView, selector;
    selector = MacArthur.CONFIG.scenarios['regional']['WAN'][1].selector;
    regions = new Backbone.Collections.RegionCollection(MacArthur.CONFIG.regions);
    filter = new Backbone.Models.Filter();
    scales = new Backbone.Collections.ScaleCollection(MacArthur.CONFIG.scales);
    filter.set('scale', scales.models[1]);
    filter.set('region', regions.models[0]);
    scenarioView = new Backbone.Views.ScenarioSelectorView({
      filter: filter
    });
    filter.set('tab', 'change');
    filter.set('subject', 'biodiversity');
    scenarioView.$el.find("#scenario-select option[value='" + selector + "']").prop('selected', true);
    scenarioView.$el.find("#scenario-select").trigger('change');
    return assert.strictEqual(filter.get('scenario'), selector);
  });

}).call(this);

(function() {
  suite('Tab View');

  test('when the `change` tab selector and the `subject` selector have been clicked, the view re-renders and the scenario subview is rendered', function() {
    var filter, filterView, regions, resultsNumber, resultsNumberRenderStub, scales, scenarioRenderSpy, tabView;
    regions = new Backbone.Collections.RegionCollection(MacArthur.CONFIG.regions);
    scales = new Backbone.Collections.ScaleCollection(MacArthur.CONFIG.scales);
    resultsNumber = new Backbone.Models.ResultsNumber({
      number: 10
    });
    resultsNumberRenderStub = sinon.stub(Backbone.Views.ResultsNumberView.prototype, 'initialize', function() {});
    filter = new Backbone.Models.Filter({
      subject: 'biodiversity',
      scale: scales.models[0],
      region: regions.models[0]
    });
    scenarioRenderSpy = sinon.spy(Backbone.Views.ScenarioSelectorView.prototype, 'render');
    tabView = new Backbone.Views.TabView({
      filter: filter,
      resultsNumber: resultsNumber
    });
    filterView = new Backbone.Views.FilterView({
      filter: filter
    });
    tabView.$el.find('li.change-tab').trigger('click');
    filterView.$el.find('.subjects li:first').trigger('click');
    try {
      assert.strictEqual(scenarioRenderSpy.callCount, 2, "Expected the filterView to be called twice");
    } finally {
      scenarioRenderSpy.restore();
    }
    return resultsNumberRenderStub.restore();
  });

  test('when the `change` tab selector has been clicked an `active` class is set on it and removed from all other siblings', function() {
    var activeTab, filter, resultsNumber, resultsNumberRenderStub, scales, tabView;
    scales = new Backbone.Collections.ScaleCollection(MacArthur.CONFIG.scales);
    resultsNumber = new Backbone.Models.ResultsNumber({
      number: 10
    });
    resultsNumberRenderStub = sinon.stub(Backbone.Views.ResultsNumberView.prototype, 'initialize', function() {});
    filter = new Backbone.Models.Filter({
      subject: 'biodiversity',
      scale: scales.models[0]
    });
    tabView = new Backbone.Views.TabView({
      filter: filter,
      resultsNumber: resultsNumber
    });
    activeTab = tabView.$el.find('ul.tabs li.active');
    assert.strictEqual(activeTab.attr('data-subject'), 'now', "Expected the `now` tab to be active");
    tabView.$el.find('li.change-tab').trigger('click');
    activeTab = tabView.$el.find('ul.tabs li.active');
    assert.strictEqual(activeTab.attr('data-subject'), 'change', "Expected the `change` tab to be active");
    assert.isFalse(activeTab.siblings().hasClass('active'), "Expected other tabs NOT to be active");
    return resultsNumberRenderStub.restore();
  });

  test('when the `Future Threats` tab selector is clicked, and the `subject` is selected and the `scenario` is selected then the LensSelectorView is rendered', function() {
    var filter, lensSelectorRenderCalles, lensSelectorRenderSpy, regions, resultsNumber, resultsNumberRenderStub, scales, tabView;
    regions = new Backbone.Collections.RegionCollection(MacArthur.CONFIG.regions);
    scales = new Backbone.Collections.ScaleCollection(MacArthur.CONFIG.scales);
    resultsNumber = new Backbone.Models.ResultsNumber({
      number: 10
    });
    resultsNumberRenderStub = sinon.stub(Backbone.Views.ResultsNumberView.prototype, 'initialize', function() {});
    filter = new Backbone.Models.Filter({
      subject: 'biodiversity',
      scale: scales.models[0],
      region: regions.models[0]
    });
    lensSelectorRenderSpy = sinon.spy(Backbone.Views.LensSelectorView.prototype, 'render');
    tabView = new Backbone.Views.TabView({
      filter: filter,
      resultsNumber: resultsNumber
    });
    lensSelectorRenderCalles = lensSelectorRenderSpy.callCount;
    tabView.$el.find('li.future_threats-tab').trigger('click');
    filter.set('subject', 'biodiversity');
    filter.set('scenario', 'mf2050');
    try {
      assert.isTrue(lensSelectorRenderSpy.callCount > lensSelectorRenderCalles, "Expected the lensSelectorView to be called");
    } finally {
      lensSelectorRenderSpy.restore();
    }
    return resultsNumberRenderStub.restore();
  });

}).call(this);
