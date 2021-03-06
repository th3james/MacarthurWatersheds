window.MacArthur ||= {}

MacArthur.CONFIG =
  tabs: [
    {
      selector: "now"
      name: "Now"
      strapline: "Current status"
    },{
      selector: "change"
      name: "Change"
      strapline: "Change between now and 2050"
    },{
      selector: "future_threats"
      name: "Future Threats"
      strapline: "Future threats from agricultural development"
    }
  ],
  regions: [
    # latLngBounds(southWest, northEast)
    { code: "WAN", name: "Andes", bounds: [ [-22,-57], [14,-83] ], centre: [-4, -61], topRow: true }
    { code: "GLR", name: "African Great Lakes", bounds: [ [-18,30], [10,40] ], centre: [-3, 43], topRow: true }
    { code: "MEK", name: "Mekong", bounds: [ [6,110], [35,90] ], centre: [21, 110], topRow: true }
    { code: "LVB", name: "Lake Victoria Basin", bounds: [ [-8,30],  [10,40] ], centre: [0, 40], topRow: false }
  ]
  scales: [
    { code: "broadscale", name: "Global", tooltip: "Global <a href='/data/global_geo4_scenarios.pdf' target='_blank'>GEO-4</a> scenarios were used to analyse full MacArthur regions"}
    { code: "regional", name: "Regional", tooltip: "<a href='/data/regionally_developed_scenarios.pdf' target='_blank'>Regionally developed</a> scenarios were used to analyse a subset of three countries in each region"}
  ,]
  subjects: [
    {
      selector: "biodiversity",
      name: "Biodiversity importance",
      threatsName: "Threats to current Biodiversity",
      nowTooltip: "Biodiversity importance is based on IUCN species ranges for amphibians, mammals, and birds in combination with their habitat affiliations and modelled land cover. <a href='/about.html'>More information</a>.",
      futureTooltip: "Threats to current biodiversity are based on expansion of agriculture under a future scenario and biodiversity is based on baseline biodiversity importance. <a href='/about.html'>More information</a>.",
      changeTooltip: "Change in biodiversity importance is based on IUCN species ranges for amphibians, mammals, and birds in combination with their habitat affiliations and modelled land cover. <a href='/about.html'>More information</a>."
    },
    {
      selector: "ecosystem",
      name: "Ecosystem function provision",
      threatsName: "Threats to current ecosystem function",
      nowTooltip: "Ecosystem function provision is based on a landscape functions approach and modelled land cover. <a href='/about.html'>More information</a>.",
      futureTooltip: "threats to current ecosystem function provision are based on expansion of agriculture under a future scenario and ecosystem function provision is based on baseline ecosystem function provision importance. <a href='/about.html'>More information</a>.",
      changeTooltip: "Change in ecosystem function provision is based on a landscape functions approach and modelled land cover. <a href='/about.html'>More information</a>."
    }
  ],
  lenses: {
    biodiversity: [
      { selector: "allsp", name: "All species", default: true }
      { selector: "crenvu", name: "All threatened" }
      { selector: "amphibia", name: "Amphibians" }
      { selector: "mammalia", name: "Mammals" }
      { selector: "aves", name: "Birds" }
    ]
    ecosystem: [
      { selector: "totef", name: "Total Ecosystem Function Provision", default: true }
      { selector: "comprov", name: "Commodity provision (cultivated products)" }
      { selector: "wildprov", name: "Wild provision" }
      { selector: "regprov", name: "Regulating functions provision" }
    ]
  },
  scenarios:
    broadscale: [
      { selector: "mf2050", name: "Markets first" }
      { selector: "susf2050", name: "Sustainability first" }
      { selector: "secf2050", name: "Security first" }
      { selector: "polf2050", name: "Policy first" }
    ]
    regional:
      WAN: [
        {
          selector: "s1_2050"
          name: "New Dawn"
        }
        {
          selector: "s2_2050"
          name: "Andean Autumn"
        }
        {
          selector: "s3_2050"
          name: "Overcoming Obstacles"
        }
        {
          selector: "s4_2050"
          name: "Flipping Burgers"
        }
      ]
      GLR: [
        {
          selector: "s1_2050"
          name: "Sleeping Lions"
        }
        {
          selector: "s2_2050"
          name: "Lone Leopards"
        }
        {
          selector: "s3_2050"
          name: "Herd of Zebra"
        }
        {
          selector: "s4_2050"
          name: "Industrious Ants"
        }
      ]
      MEK: [
        {
          selector: "s1_2050"
          name: "Land of the Golden Mekong"
        }
        {
          selector: "s2_2050"
          name: "Buffalo, Buffalo"
        }
        {
          selector: "s3_2050"
          name: "The DoReKi Dragon"
        }
        {
          selector: "s4_2050"
          name: "Tigers on a Train"
        }
      ]
      LVB: [
        {
          selector: "s1_2050",
          name: "Sleeping Lions"
        }, {
          selector: "s2_2050",
          name: "Lone Leopards"
        }, {
          selector: "s3_2050",
          name: "Herd of Zebra"
        }, {
          selector: "s4_2050",
          name: "Industrious Ants"
        }
      ]
  scenariosPdfs:
    broadscale: "http://www.unep.org/geo/geo4.asp"
    regional: "/data/regionally_developed_scenarios.pdf"
  levels: {
    default: [
      { selector: "all", name: "All", default: true }
      { selector: "high", name: "High" }
      { selector: "medium", name: "Medium" }
      { selector: "low", name: "Low" }
    ],
    change: [
      { selector: "all", name: "All", default: true }
      { selector: "increase", name: "Increase" }
      { selector: "low", name: "Low Decrease" }
      { selector: "medium", name: "Medium Decrease" }
      { selector: "high", name: "High Decrease" }
    ]
  },
  protectionLevels: [
    { selector: "high", name: "66% -100% covered" , default: true }
    { selector: "medium", name: "33% - 66% covered" }
    { selector: "low", name: "0 -  33% covered" }
  ],
  pressureLevels: [
    { selector: "high", name: "High" , default: true }
    { selector: "medium", name: "Medium" }
    { selector: "low", name: "Low" }
  ]

MacArthur.getFilterOptionsWithSelectedSet = (filter, options) ->
  collection_name = options.plural or "#{options.name}s"
  option = MacArthur.CONFIG[collection_name][options.scale]?[options.region] or
    MacArthur.CONFIG[collection_name][options.scale] or
    MacArthur.CONFIG[collection_name]
  _.map(option, (element) ->
    if filter.get(options.name) is element.selector
      element.active = true
    else
      element.active = false
    element
  )
