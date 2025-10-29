import "https://js.arcgis.com/map-components/4.32/arcgis-map-components.esm.js";
import { downloadFeatureLayerAsGeoJSON } from "./download.js";

window.addEventListener("DOMContentLoaded", async () => {
  const [
    FeatureLayer,
    esriRequest,
    SimpleRenderer,
    SimpleLineSymbol,
    MapImageLayer,
    webMercatorUtils,
    GraphicsLayer,
    Graphic,
    Point,
    SpatialReference,
    SimpleFillSymbol,
    Polyline,
    geometryEngineAsync,
    geometryEngine,
  ] = await $arcgis.import([
    "@arcgis/core/layers/FeatureLayer.js",
    "@arcgis/core/request.js",
    "@arcgis/core/renderers/SimpleRenderer.js",
    "@arcgis/core/symbols/SimpleLineSymbol.js",
    "@arcgis/core/layers/MapImageLayer.js",
    "@arcgis/core/geometry/support/webMercatorUtils.js",
    "@arcgis/core/layers/GraphicsLayer.js",
    "@arcgis/core/Graphic.js",
    "@arcgis/core/geometry/Point.js",
    "@arcgis/core/geometry/SpatialReference.js",
    "@arcgis/core/symbols/SimpleFillSymbol.js",
    "@arcgis/core/geometry/Polyline.js",
    "@arcgis/core/geometry/geometryEngineAsync.js",
    "@arcgis/core/geometry/geometryEngine.js"
  ]);


  console.log(layers);

/// Intranet PM REST services
  //let url_prefix = "https://rhapps.dot.ca.gov/server/rest/services/API/RestAPI/MapServer";

  /// Public PM REST services
  let url_prefix = "https://caltrans-gis.dot.ca.gov/arcgis/rest/services//RH/RestAPI/MapServer";

  const config_url = "https://svgcdeaprod.dot.ca.gov/docs/DEA_Library_2_0/config_id_AddLayer.json";
   
  const arcgisMap = document.querySelector("arcgis-map");
  const arcgisSearch = document.querySelector("arcgis-search");  
  const primaryShellPanel = document.getElementById("primary-shell-panel");
  const endShellPanel = document.getElementById("end-shell-panel");
  let currentMapView = null;
  const tableElement = document.querySelector("arcgis-feature-table");
  const tableShellPanel = document.getElementById("table-shell-panel");
  const toggleTable = document.getElementById("toggle-table");
  const tab1 = document.getElementById("tab1");

  let countyselection,
    countyselection_rte,
    routeselection,
    routeselection_Rte,
    Endcountyselection,
    routeID,
    thebeg_routeid,
    theend_routeid,
    thebeg_original_routeid,
    theend_original_routeid,
    eleBeg,
    eleEnd,
    thedata,
    mapClickEvent,
    GoogleClickEvent,
    thetolerance,
    tol,    
    layerselection,
    layerselection_geom


  let _extentHistory = [];
  let _extentHistoryIndx = -1;
  let intitial_view = false;
  let _prevExtentAction = false;
  let _nextExtentAction = false;
  let renderer = null;
  let layers_config = null;
  const zoomPrevAction = document.getElementById("previous");
  const zoomNextAction = document.getElementById("next");
  const actionBarLeft = document.getElementById("action-bar-left");

  let notice = document.getElementById("message");
  let notice2 = document.getElementById("message2");

  let layersCount = 0;
  let layersCount_nowater = 0;
  let total_layer_heading = "";
  let total_layer_heading_nowater = "";
  let old_subject = [];
  let DIST_SELECTED = "ALL";
  let BegPMatStart = null;
  let BegPMatEnd = null;
  let EndPMatStart = null;
  let EndPMatEnd = null;
  let BegPM_original = null;
  let BegPM_changed = false;
  let EndPM_original = null;
  let EndPM_changed = false;
  let Begin_PM = null;
  let End_PM = null;
  let PM_Pts_layer = null;
  let PM_Pts_graphics = [];
  let PM_Seg_layer = null;
  let PM_Seg_graphics = [];
  let stop_process = false;
  let counter_Pts = 0;
  let counter_Seg = 0;
   let correct_routeID = "";
    let correct_Beg_RouteID = null;
  let correct_End_RouteID = null;
   let thegraphic_pm = null;
   let beg_routeId = true;
  let end_routeId = true;
  let invalid_routeID = "";
  let graphicsLayer_buffer = null;
    let selected_buffer_lyrs_urls = [];
  let firstqueryon = true;

  let PMClickedgraphics = new GraphicsLayer();
  PMClickedgraphics.id = "PM nearest clicked point";
  PMClickedgraphics.listMode = "hide";

  const bufferLayer = new GraphicsLayer();

  // Get all panel elements
  //left
  const legendPanel = document.getElementById("legend-panel");
  const layersPanel = document.getElementById("layers-panel");
  const basemapsPanel = document.getElementById("basemap-panel");
  const printPanel = document.getElementById("print-panel");
  const arcgisFeatures = document.querySelector("arcgis-features");

  //right
  const open_addlayers_btn = document.querySelector("#addlayers");
  const postmile_tools_btn = document.querySelector("#postmile");
  const add_data_btn = document.querySelector("#add_data");
  const query_attrs_btn = document.querySelector("#query_attrs");
  const query_geom_btn = document.querySelector("#query_geom");
  const measurement_btn = document.querySelector("#measurement");
  const sketch_btn = document.querySelector("#Sketch");
  const Google_btn = document.querySelector("#Google");
  const STEVE_btn = document.querySelector("#STEVELoader");
  const elevation_btn = document.querySelector("#elevation");
  const session_btn = document.querySelector("#session");
  const addlayers_panel = document.getElementById("add-layers-panel");
  const postmile_panel = document.getElementById("postmile-panel");
  const addata_panel = document.getElementById("add-data-panel");
  const query_attrs_panel = document.getElementById("query-attrs-panel");
  const query_geom_panel = document.getElementById("query-geom-panel");
  const elevation_panel = document.getElementById("elevation-panel");
  const measurement_panel = document.getElementById("measurement-panel");
  const sketch_panel = document.getElementById("sketch-panel");
  const google_panel = document.getElementById("google-panel");
  //const STEVE  = document.getElementById("STEVE-panel");
  const session_panel = document.getElementById("session-panel");


  var pointSymbol = {
    type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
    color: [255, 0, 0],
    outline: {
      // autocasts as new SimpleLineSymbol()
      color: [0, 0, 0],
      width: 2,
    },
  };

  var polylineSymbol = {
    type: "simple-line", // autocasts as SimpleLineSymbol()
    color: [255, 0, 0],
    width: 4,
  };

  const symbol = new SimpleFillSymbol({
    style: "none",
    outline: {
      color: "#333",
      width: 3,
    },
  });

  const polygonSymbol = {
    type: "simple-fill",
    color: [227, 139, 79, 0.8], // Orange, opacity 80%
    outline: {
      color: [0, 0, 0],
      width: 4,
    },
  };

  const rightpanels = [
    addlayers_panel,
    postmile_panel,
    addata_panel,
    query_attrs_panel,
    query_geom_panel,
    elevation_panel,
    measurement_panel,
    sketch_panel,
    google_panel,
    session_panel,
  ];

  const rightpanelActions = document.querySelectorAll("[data-action-id]");
  const leftpanels = [legendPanel, layersPanel, basemapsPanel, printPanel];
  const leftpanelActions = document.querySelectorAll("[data-toggle-panel]");

  let existing_view = arcgisMap.extent;

  arcgisMap.padding = {
    left: 49,
    right: 0,
    bottom: 0,
    top: 0,
  };



  arcgisMap.addEventListener("arcgisViewReadyChange", async (event) => {
    arcgisMap.map.add(PMClickedgraphics);
    currentMapView = arcgisMap.view; // Get the underlying MapView instance
    console.log(arcgisMap.view);

    if (!currentMapView) {
      console.error("MapView not available on arcgis-map component.");
      return;
    }

    var coordsWidget = document.createElement("div");
    coordsWidget.id = "coordsWidget";
    coordsWidget.className = "esri-widget esri-component";
    coordsWidget.style.marginRight = "60px";
    coordsWidget.style.padding = "7px 15px 15px";
    currentMapView.ui.add(coordsWidget, "bottom-right");

    function showCoordinates(pt) {
      var coords =
        "Lat/Lon " +
        pt.latitude.toFixed(3) +
        " " +
        pt.longitude.toFixed(3) +
        " | Scale 1:" +
        Math.round(currentMapView.scale * 1) / 1 +
        " | Zoom " +
        currentMapView.zoom;
      coordsWidget.innerHTML = coords;
    }
    // Watch for changes to the view's 'stationary' property.
    // This is the most reliable way to detect when map movement has finished.
    currentMapView.watch("stationary", (isStationary) => {
      if (isStationary) {
        // Only record the extent if the movement was NOT initiated by our previous/next buttons.
        if (!_prevExtentAction && !_nextExtentAction) {
          if (currentMapView.extent && currentMapView != existing_view) {
            // Ensure extent object exists
            extentChangeHandler(currentMapView.extent);
          }
        }
        // Always reset these flags once the view becomes stationary,
        // regardless of the source of movement. This prepares them for the next interaction.
        _prevExtentAction = false;
        _nextExtentAction = false;
        showCoordinates(currentMapView.center);
      }      
     
    });


    // Initial capture of the extent once the view is fully loaded and stable.
    // This ensures the very first view is added to history.
    currentMapView.when(() => {
      intitial_view = true;
      if (currentMapView.extent) {
        extentChangeHandler(currentMapView.extent);
      }
      
    });

      
 const scaleBar = document.querySelector('arcgis-scale-bar');
      // await scaleBar.componentOnReady();
      // const scaleText = scaleBar.shadowRoot.querySelector('.esri-scale-bar').textContent.trim();
      //   console.log(scaleText)
    // Initialize the state of the Previous/Next buttons
    // extentHistoryChange();
    handleAddLayersWidgetClick("HQ");
  });

  ////  Message about adding a featurelayer   ////////////////
  function notifyusers() {
    document.getElementById("Message_html").innerHTML =
      "A feature layer was added. Check the Active Layers widget located on the left-side toolbar for more info";
    notice.open = true;
  }

  function zoomNextExtent(view) {
    if (_extentHistoryIndx < _extentHistory.length - 1) {
      _nextExtentAction = true;
      _extentHistoryIndx++;
      view
        .goTo(_extentHistory[_extentHistoryIndx].currentExtent)
        .catch((error) => {
          if (error.name !== "AbortError") {
            console.error("goTo() failed: ", error);
          }
        });
    }
  }

  function zoomPreviousExtent(view) {
    if (_extentHistoryIndx > 0) {
      _prevExtentAction = true;
      _extentHistoryIndx--;
      view
        .goTo(_extentHistory[_extentHistoryIndx].currentExtent)
        .catch((error) => {
          if (error.name !== "AbortError") {
            console.error("goTo() failed: ", error);
          }
        });
    }
  }

  function extentChangeHandler(extent) {
    if (_extentHistoryIndx < _extentHistory.length - 1) {
      _extentHistory = _extentHistory.slice(0, _extentHistoryIndx + 1);
    }

    _extentHistory.push({
      currentExtent: extent.clone(),
    });
    _extentHistoryIndx = _extentHistory.length - 1;
    if (_extentHistory.length > 2) {
      zoomPrevAction.disabled = false;
    }
    if (_extentHistory.length > 3) {
      zoomNextAction.disabled = false;
    }
  }
  /// Handle click on previous or next buttons
  const handleLeftActionBarClick = ({ target }) => {
    const action = target.closest("calcite-action");
    if (!action) {
      return;
    }

    if (!currentMapView) {
      console.warn("Map view not ready yet to handle navigation.");
      return;
    }

    if (action.id === "previous") {
      zoomPreviousExtent(currentMapView);
    } else if (action.id === "next") {
      zoomNextExtent(currentMapView);
    }
  };

  actionBarLeft.addEventListener("click", handleLeftActionBarClick);

  // Feature Table Setup
  const mapForFeatureTable = document.querySelector("arcgis-map");
  const arcgisFeatureTable = document.querySelector("arcgis-feature-table");

  mapForFeatureTable.addEventListener("arcgisViewReadyChange", (event) => {
    const arcgisMap = event.target;
    const tableLayer = arcgisMap.map.allLayers.find(
      (layer) => layer.id === "test"
    );
    arcgisFeatureTable.view = arcgisMap.view;
    arcgisFeatureTable.layer = tableLayer;
    arcgisFeatureTable.filterGeometry = arcgisMap.view.extent;
  });

  mapForFeatureTable.addEventListener("arcgisViewChange", (event) => {
    arcgisFeatureTable.filterGeometry = event.target.view.extent;
  });

  toggleTable.addEventListener("click", () => {
    const toggleValue = !tableShellPanel.collapsed;
    closeOpenShellPanels();
    tableShellPanel.collapsed = toggleValue;
    toggleTable.active = !toggleValue;
    document.getElementById("links").open = false;
    document.getElementById("support").open = false;
    primaryShellPanel.collapsed = true;
  });

  // Panel Management
  leftpanelActions.forEach((action) => {
    // console.log(action)
    action.addEventListener("click", () => {
      arcgisMap.view.popup.visible = true;
      if (tab1.hasAttribute("selected")) {
      tab1.removeAttribute("selected");
      console.log("Tab1 deselected because click was outside tabs");
    }

      const id = action.getAttribute("data-toggle-panel");
      console.log(id);      
      const toggleValue = action.active;
      closeOpenShellPanels();
      primaryShellPanel.collapsed = toggleValue;

      leftpanelActions.forEach(
        (el) => (el.active = el === action && !toggleValue)
      );

      leftpanels.forEach((panel) => {
        const open = panel.id === id;
        panel.closed = !open;
        panel.hidden = !open;
      });
      document.getElementById("links").open = false;
      document.getElementById("support").open = false;

      arcgisFeatures.close();
    });
  });
 
 
  rightpanelActions.forEach((action) => {
    action.addEventListener("click", () => {
      arcgisMap.view.popup.visible = true;
      if (tab1.hasAttribute("selected")) {
      tab1.removeAttribute("selected");
      console.log("Tab1 deselected because click was outside tabs");
    }
      const id = action.getAttribute("data-action-id");
      const toggleValue = action.active;
      closeOpenShellPanels();
      endShellPanel.collapsed = toggleValue;

      rightpanelActions.forEach(
        (el) => (el.active = el === action && !toggleValue)
      );

      rightpanels.forEach((panel) => {
        const open = panel.id === id;
        panel.closed = !open;
        panel.hidden = !open;
      });
    });
  });

  function setupPanelToggle(triggerId, panelToCloseId) {
    document.getElementById(triggerId).addEventListener("click", () => {
      const clickedPanel = document.getElementById(triggerId);
      clickedPanel.open = clickedPanel.open === true ? false : true;

      document.getElementById("primary-shell-panel").collapsed = true;
      document.getElementById(panelToCloseId).open = false;
    });
  }

  setupPanelToggle("settings-action", "links");
  setupPanelToggle("settings-action1", "support");

  primaryShellPanel.collapsed = true;
  primaryShellPanel.addEventListener("calcitePanelClose", () => {
    primaryShellPanel.collapsed = true;
    leftpanelActions.forEach((el) => (el.active = false));
  });


  //click on map and found a feature to display features widget
  arcgisMap.addEventListener("arcgisViewClick", async (event) => {
    // closeOpenShellPanels();
    console.log(event);
    

    // Check if tab1 is currently active

    const view = arcgisMap.view;
    const { mapPoint } = event.detail;
    console.log(mapPoint);

    const screenPoint = view.toScreen(mapPoint);
    const hit = await view.hitTest(screenPoint);

    if (tab1.selected) {
      console.log("Tab 1 is active");
      computePM_from_ClickedPoint(mapPoint);
    } else {
      console.log("Tab 1 is not active");
    }
 
    arcgisMap.view.map.layers.forEach((lyr) => {
      let fieldsInfo = [];
        if (lyr.type === "feature") {
          let content = "";
          lyr.fields.forEach((field) => {
            let alias = field.alias;
            let name = field.name;

            let fieldInfo = {
              fieldName: field.name,
              label: field.alias,
            };
            fieldsInfo.push(fieldInfo);
          });

          var popupTemplate = {
            // autocasts as new PopupTemplate()
            title: lyr.title,
            content: [
              {
                type: "fields",
                fieldInfos: fieldsInfo,
              },
            ],
          };
          lyr.popupTemplate = popupTemplate;
        }
    })

    const featureResults = hit.results.filter(
      (r) =>
        r.graphic &&
        r.graphic.attributes &&
        Object.keys(r.graphic.attributes).length > 0 &&
        r.graphic.geometry // ensures geometry is not null
    );

    if (featureResults.length > 0) {
      let graphic = featureResults[0].graphic
      const graphics = [graphic];
      arcgisFeatures.open({ features: graphics });    
      primaryShellPanel.collapsed = false;
    } else {
      primaryShellPanel.collapsed = true;
    }

    leftpanels.forEach((panel) => {
      panel.hidden = true;
      panel.closed = true;
    });

     

       
    // arcgisFeatures.open({
    //   location: mapPoint,
    //   fetchFeatures: true,
    // });
    //  }
  });

  document.addEventListener("calciteFlowItemClose", (event) => {
    const flowItem = event.target;
    if (flowItem.closest("arcgis-features")) {
      //if close is clicked collapse primary shell panel.
      primaryShellPanel.collapsed = true;
    }
  });

  function closeOpenShellPanels() {
    document.querySelectorAll("calcite-shell-panel").forEach((panel) => {
      if (panel.id !== "primary-shell-panel") {
        panel.collapsed = true;
      }
      if (panel.id !== "end-shell-panel") {
        panel.collapsed = true;
      }
    });

    document.querySelectorAll("calcite-action[active]").forEach((action) => {
      action.active = false;
    });

    leftpanels.forEach((panel) => {
      panel.hidden = true;
      panel.closed = true;
    });
    rightpanels.forEach((panel) => {
      panel.hidden = true;
      panel.closed = true;
    });
  }

  //closeOpenShellPanels();

  const actionBarEl = document.getElementById("action-bar-left");

  (async () => {
    await customElements.whenDefined("calcite-action");
    const actions = [...document.getElementsByTagName("calcite-action")];
    addTooltips(actions);
  })();

  function addTooltips(actions) {
    actions.forEach((action) => {
      const tooltip = document.createElement("calcite-tooltip");
      tooltip.referenceElement = action.id;
      tooltip.innerHTML = `${action.getAttribute("text")}`;
      actionBarEl.appendChild(tooltip);
    });
  }

  const arcgisLayerList = document.querySelector("arcgis-layer-list");

  arcgisLayerList.listItemCreatedFunction = (event) => {
    const item = event.item;

    if (event.item.layer.type === "feature") {
      item.actionsSections = [
        [
          {
            title: "Go to full extent",
            className: "esri-icon-zoom-out-fixed",
            id: "full-extent",
          },
          {
            title: "Link to REST Service",
            className: "esri-icon-description",
            id: "information",
          },
          {
            title: "Download layer as ESRI GeoJSON",
            className: "esri-icon-download",
            id: "downloadLayer",
          },
          {
            title: "Remove Layer",
            className: "esri-icon-trash",
            id: "removeLayer",
          },
        ],
      ];
    }

    const label = document.createElement("calcite-label");
    label.innerText = "Opacity";
    label.scale = "s";

    const slider = document.createElement("calcite-slider");
    slider.labelHandles = true;
    slider.labelTicks = true;
    slider.min = 0;
    slider.minLabel = "0";
    slider.max = 1;
    slider.maxLabel = "1";
    slider.scale = "s";
    slider.step = 0.01;
    slider.value = 1;
    slider.ticks = 0.5;

    slider.addEventListener("calciteSliderChange", () => {
      item.layer.opacity = slider.value;
    });

    label.appendChild(slider);

    item.panel = {
      content: label,
      icon: "sliders-horizontal",
      title: "Change layer opacity",
    };
  };

  arcgisLayerList.addEventListener("arcgisTriggerAction", (event) => {
    var visibleLayer = event.detail.item.layer;
    const id = event.detail.action.id;

    if (id === "full-extent") {
      arcgisMap?.goTo(visibleLayer.fullExtent).catch((error) => {
        if (error.name != "AbortError") {
          console.error(error);
        }
      });
    }

    if (id === "information") {
      window.open(visibleLayer.url + "/" + visibleLayer.layerId);
    }

    if (id === "removeLayer") {
      let thelayer = visibleLayer.url + "/" + visibleLayer.layerId;
      for (let i = 0; i < layers_config.layers.length; i++) {
        if (layers_config.layers[i].url === thelayer) {
          document.getElementById("Message_html").innerHTML =
            "Please turn off this layer using the Layer List widget.";
          notice.open = true;
          return;
        }
      }
      arcgisMap.map.remove(visibleLayer);
    }
    if (id === "downloadLayer") {
      downloadFeatureLayerAsGeoJSON(visibleLayer);
    }
  });

  const extentCheckbox = document.getElementById("filter_map_extent");
  arcgisMap.addEventListener("arcgisViewChange", () => {
    if (extentCheckbox.checked) {
      tableElement.filterGeometry = arcgisMap.extent;
    } else {
      tableElement.filterGeometry = null;
    }
  });

  document.getElementById("exportCSV").addEventListener("click", async () => {
    const selectedOIDs = tableElement.highlightIds;
    if (selectedOIDs.length === 0) {
      exportallvisiblefeatures();
    } else {
      tableElement.exportSelectionToCSV("selected-records.csv");
    }
  });

  async function exportallvisiblefeatures() {
    let layer = tableElement.layer;
    const extent = arcgisMap.extent;
    const query = layer.createQuery();
    query.geometry = extent;
    query.outFields = ["*"];
    query.returnGeometry = false;
    query.start = 0;

    const features = [];
    const maxRecordCount = layer.capabilities.query.maxRecordCount || 2000;

    let hasMore = true;
    while (hasMore) {
      query.start = features.length;
      query.num = maxRecordCount;
      const response = await layer.queryFeatures(query);
      features.push(...response.features);
      if (!response.exceededTransferLimit) {
        hasMore = false;
      }
    }
    const geoJson = {
      type: "FeatureCollection",
      features: features.map((feature) => ({
        type: "Feature",
        properties: feature.attributes,
      })),
    };
    geoJsonToCsv(geoJson);
  }

  function geoJsonToCsv(geoJson) {
    const headers = Object.keys(geoJson.features[0].properties);
    const csvContent = [
      headers.join(","),
      ...geoJson.features.map((feature) =>
        headers
          .map((header) => JSON.stringify(feature.properties[header] || ""))
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  document.getElementById("close_table").addEventListener("click", () => {
    tableShellPanel.collapsed = true;
  });

  // Dark Mode
  const darkModeCss = document.querySelector("#arcgis-maps-sdk-theme-dark");
  const lightModeCss = document.querySelector("#arcgis-maps-sdk-theme-light");

  document
    .querySelector("calcite-switch")
    .addEventListener("calciteSwitchChange", () => {
      const isDarkMode = document.body.classList.contains("calcite-mode-dark");
      const setDarkMode = !isDarkMode;

      darkModeCss.disabled = !setDarkMode;
      lightModeCss.disabled = setDarkMode;

      arcgisMap.map.basemap = setDarkMode
        ? "streets-night-vector"
        : "streets-navigation-vector";

      document.body.classList.toggle("calcite-mode-dark", setDarkMode);
      document.body.classList.toggle("calcite-mode-light", !setDarkMode);

      document.body
        .querySelectorAll(".calcite-mode-light, .calcite-mode-dark")
        .forEach((el) => {
          el.classList.remove("calcite-mode-light", "calcite-mode-dark");
          el.classList.add(
            setDarkMode ? "calcite-mode-dark" : "calcite-mode-light"
          );
        });

      const mapComponent = document.querySelector("arcgis-map");
      const shadowUiElements =
        mapComponent?.shadowRoot?.querySelectorAll(".esri-ui");
      shadowUiElements?.forEach((el) => {
        el.classList.remove("calcite-mode-light", "calcite-mode-dark");
        el.classList.add(
          setDarkMode ? "calcite-mode-dark" : "calcite-mode-light"
        );
      });

      const nav = document.querySelector("calcite-navigation");
      if (nav) {
        nav.classList.remove("calcite-mode-light", "calcite-mode-dark");
        nav.classList.add(
          setDarkMode ? "calcite-mode-dark" : "calcite-mode-light"
        );
      }
    });

  // About Message
  const themessage = `
  This is the newer version of the DEA GIS Library. This version is developed using 
  <a href="https://developers.arcgis.com/javascript/latest/" target="_blank">ArcGIS Maps SDK for JavaScript version 4.x</a> 
  and 
  <a href="https://developers.arcgis.com/calcite-design-system/" target="_blank">Calcite Design System</a>.<br><br>

  DEA GIS Library 2.0.x is a customized GIS application tailored to the needs of the environmental community at Caltrans.
  Its goal is to provide quick access to environmental spatial information, assist with spatial analysis, and provide crucial information
  regarding resources within the boundaries of planned projects.<br><br>

  DEA GIS Library was developed by the HQ Division of Environmental Analysis GIS staff.<br><br>

  If you have questions:<br>
  - For data, please contact <a href="mailto:anthony.barnes@dot.ca.gov">Anthony Barnes</a><br>
  - For widgets, tools, and functionality, contact <a href="mailto:lefteris.koumis@dot.ca.gov">Lefteris Koumis</a>
`;

  document.getElementById("about-button").addEventListener("click", () => {
    document.getElementById("about-notice-content").innerHTML = themessage;
    document.getElementById("notice-container").style.display = "block";
  });

  document
    .getElementById("about-notice")
    .addEventListener("calciteNoticeClose", () => {
      document.getElementById("notice-container").style.display = "none";
    });

  /////Selection of District  /////////////////////////////////////
  const menuItems = [...document.getElementsByTagName("calcite-dropdown-item")];

  menuItems.forEach((menuItem) => {
    menuItem.addEventListener("calciteDropdownItemSelect", (evt) => {
      console.log(evt);
      // if (evt.target.dataset.menuItem === "close-on-select") {
      //   console.log(`${evt.target.text} selected`);
      document.getElementById("district_id").innerHTML =
        "Current Display: " + evt.target.innerHTML;

      menuItems.forEach((menuItem) => {
        menuItem.open = false;
      });
      // }
      select_district(evt.target.innerHTML);
    });
  });

  async function removemaskedfL(fL) {
    arcgisMap.view.map.layers.map(async function (lyr) {
      if (lyr.url && lyr.url.includes("Mask")) {
        await arcgisMap.map.remove(lyr);
      }
    });
  }

  function select_district(district) {
    var fL = new FeatureLayer({
      url: "https://svgcdeaprod.dot.ca.gov/dea_gis/rest/services/EnvLib_Agencies/CTDistMask/MapServer/0",
      opacity: 0.5,
    });
    const headingElement = document.getElementById("custom-heading");
    switch (district) {
      case "All Districts":
        //DIST_SELECTED = "All Districts";
        if (fL) {
          removemaskedfL(fL);
        }
        handleAddLayersWidgetClick("HQ");
        arcgisMap.view.goTo({
          center: [-120.45, 37.183],
          zoom: 6,
        });
        headingElement.innerHTML = total_layer_heading;
        break;

      case "D1":
        //DIST_SELECTED = "1";
        if (fL) {
          removemaskedfL(fL);
        }
        handleAddLayersWidgetClick("1");
        arcgisMap.view.center = [-123.463, 40.051];
        fL.definitionExpression = "DIST= 1";
        arcgisMap.view.zoom = 7;

        arcgisMap.map.add(fL);
        headingElement.innerHTML = total_layer_heading;
        break;
      ///////////////////////////////////////
      case "D2":
        //DIST_SELECTED = "2";
        if (fL) {
          removemaskedfL(fL);
        }
        handleAddLayersWidgetClick("2");
        arcgisMap.view.center = [-121.389, 40.861];
        fL.definitionExpression = "DIST= 2";
        arcgisMap.view.zoom = 8;
        headingElement.innerHTML = total_layer_heading_nowater;
        arcgisMap.map.add(fL);
        break;
      ////////////////////////////////////
      case "D3":
        //DIST_SELECTED = "3";
        if (fL) {
          removemaskedfL(fL);
        }
        handleAddLayersWidgetClick("3");
        arcgisMap.view.center = [-121.15, 39.149];
        fL.definitionExpression = "DIST= 3";
        arcgisMap.view.zoom = 8;
        headingElement.innerHTML = total_layer_heading_nowater;
        arcgisMap.map.add(fL);
        break;
      ///////////////////////////////////
      case "D4":
        //DIST_SELECTED = "4";
        if (fL) {
          removemaskedfL(fL);
        }
        handleAddLayersWidgetClick("4");
        arcgisMap.view.center = [-122.175, 37.965];
        fL.definitionExpression = "DIST= 4";
        arcgisMap.view.zoom = 8;

        arcgisMap.map.add(fL);
        headingElement.innerHTML = total_layer_heading;
        break;
      ////////////////////////////////////////
      case "D5":
        //DIST_SELECTED = "5";
        if (fL) {
          removemaskedfL(fL);
        }
        handleAddLayersWidgetClick("5");
        arcgisMap.view.center = [-120.775, 35.697];
        fL.definitionExpression = "DIST= 5";
        arcgisMap.view.zoom = 7;

        arcgisMap.map.add(fL);
        headingElement.innerHTML = total_layer_heading;
        break;
      //////////////////////////////////////////
      case "D6":
        //DIST_SELECTED = "6";
        if (fL) {
          removemaskedfL(fL);
        }
        handleAddLayersWidgetClick("6");
        arcgisMap.view.center = [-119.302, 35.971];
        fL.definitionExpression = "DIST= 6";
        arcgisMap.view.zoom = 7;
        headingElement.innerHTML = total_layer_heading_nowater;
        arcgisMap.map.add(fL);
        break;
      //////////////////////////////////////////////
      case "D7":
        //DIST_SELECTED = "7";
        if (fL) {
          removemaskedfL(fL);
        }
        handleAddLayersWidgetClick("7");
        arcgisMap.view.center = [-118.611, 34.286];
        fL.definitionExpression = "DIST= 7";
        arcgisMap.view.zoom = 9;

        arcgisMap.map.add(fL);
        headingElement.innerHTML = total_layer_heading;
        break;
      ////////////////////////////////////////////////
      case "D8":
        //DIST_SELECTED = "8";
        if (fL) {
          removemaskedfL(fL);
        }
        handleAddLayersWidgetClick("8");
        arcgisMap.view.center = [-115.79, 34.517];
        fL.definitionExpression = "DIST= 8";
        arcgisMap.view.zoom = 8;
        headingElement.innerHTML = total_layer_heading_nowater;
        arcgisMap.map.add(fL);

        break;
      //////////////////////////////////////////////
      case "D9":
        //DIST_SELECTED = "9";
        if (fL) {
          removemaskedfL(fL);
        }
        handleAddLayersWidgetClick("9");
        arcgisMap.view.center = [-118.912, 36.627];
        fL.definitionExpression = "DIST= 9";
        arcgisMap.view.zoom = 7;
        headingElement.innerHTML = total_layer_heading_nowater;
        arcgisMap.map.add(fL);
        break;
      ///////////////////////////////////////////
      case "D10":
        //DIST_SELECTED = "10";
        if (fL) {
          removemaskedfL(fL);
        }
        handleAddLayersWidgetClick("10");
        arcgisMap.view.center = [-120.473, 37.892];
        fL.definitionExpression = "DIST= 10";
        arcgisMap.view.zoom = 8;

        arcgisMap.map.add(fL);
        break;
      //////////////////////////////////////////////
      case "D11":
        //DIST_SELECTED = "11";
        if (fL) {
          removemaskedfL(fL);
        }
        handleAddLayersWidgetClick("11");
        arcgisMap.view.center = [-116.0, 32.958];
        fL.definitionExpression = "DIST= 11";
        arcgisMap.view.zoom = 9;

        arcgisMap.map.add(fL);
        headingElement.innerHTML = total_layer_heading;
        break;
      ////////////////////////////////////////////////////////
      case "D12":
        //DIST_SELECTED = "12";
        if (fL) {
          removemaskedfL(fL);
        }
        handleAddLayersWidgetClick("12");
        arcgisMap.view.center = [-117.73, 33.701];
        fL.definitionExpression = "DIST= 12";
        arcgisMap.view.zoom = 10;

        arcgisMap.map.add(fL);
        headingElement.innerHTML = total_layer_heading;
        break;
    }
  }

  async function handleAddLayersWidgetClick(district) {
    var proceed = null;
    close_widgets();
    arcgisMap.view.graphics.removeAll();
    arcgisMap.view.map.layers.map(async function (lyr) {
      if (lyr.url && !lyr.url.includes("Districts_w_StateOutline")) {
        arcgisMap.map.remove(lyr);
      }
    });
    endShellPanel.collapsed = false;
    endShellPanel.hidden = false;
    addlayers_panel.hidden = false;
    addlayers_panel.closed = false;

    // Modify search layers pool
    load_layer_names("name");

    var options = {
      query: {
        f: "json",
      },
      responseType: "json",
    };

    layers_config = null;

    // repopulate add layers widget to selected district
    await esriRequest(
      config_url,
      //"./docs/config_id_AddLayer.json",
      //add_config_url,
      options
    ).then((response) => {
      let json = response.data;
      layers_config = json
      //console.log(json);
      var layer_subject = [];
      layer_subject.length = 0;
      var thecontent = [];
      thecontent.length = 0;
      var layer_name = "";
      var selected_dist = "";

      var district_specific = "1,2,3,4,5,6,7,8,9,11";
      district_specific = district_specific.split(",").map(Number);
      if (
        district === "HQ" ||
        !district_specific.includes(parseInt(district))
      ) {
        document.getElementById("Specific").hidden = true;
      } else {
        document.getElementById("Specific").hidden = false;
      }
      document
        .querySelectorAll(".layer-checkboxes")
        .forEach((el) => el.remove());
      if (json && json.layers) {
        json.layers.forEach((layer, i) => {
          const { subject, dist, url, name } = layer;
          selected_dist = dist;
          //console.log(json.layers[i].name)
          if (selected_dist != "ALL") {
            selected_dist = selected_dist.split(",").map(Number);
          }
          // if statewide show all except district specific
          if (
            (district === "HQ" ||
              selected_dist === "ALL" ||
              selected_dist.includes(parseInt(district))) &&
            !json.layers[i].subject.includes("specific")
          ) {
            proceed = true;
          } else if (
            district != "HQ" &&
            selected_dist != "ALL" &&
            json.layers[i].subject.includes("specific") &&
            selected_dist.includes(parseInt(district))
          ) {
            proceed = true;
          } else {
            proceed = false;
          }

          if (proceed) {
            const tab = document.querySelector(`calcite-tab[id="${subject}"]`);
            if (!tab) {
              console.warn(`No tab found for subject="${subject}"`);
              return;
            }
            let layer_name = layer.name;
            let needsIndent =
              layer_name.includes(
                "2025 - 2026 Projects (Current RTL) - Spot"
              ) ||
              layer_name.includes(
                "Past Projects (Before Current FY RTL) - Spot"
              ) ||
              layer_name.includes(
                "Future Projects (After Current FY RTL) - Spot"
              ) ||
              layer_name.includes("Other Projects (No RTL) - Spot") ||
              layer_name.includes(
                "2025 - 2026 Projects (Current RTL) - Segment"
              ) ||
              layer_name.includes(
                "Past Projects (Before Current FY RTL) - Segment"
              ) ||
              layer_name.includes(
                "Future Projects (After Current FY RTL) - Segment"
              ) ||
              layer_name.includes("Other Projects (No RTL) - Segment");

            let container = tab.querySelector(".layer-checkboxes");
            if (!container) {
              container = document.createElement("div");
              container.className = "layer-checkboxes";
              tab.appendChild(container);
            }

            //   const id = `chk-${name.replace(/\s+/g, "-").toLowerCase()}`;
            // if (url.includes("EnvLib_CT/Projects_BLM_BMMN/MapServer/3")){
            //   console.log(id)
            //   console.log(name)
            // }
            const id = name;

            const chk = document.createElement("calcite-checkbox");
            chk.id = id;
            chk.value = url;
            chk.addEventListener("click", () => {
              LoadLayer(json.layers[i]);
            });

            const lbl = document.createElement("label");
            lbl.setAttribute("for", id);
            lbl.innerHTML = `&nbsp;${name}`;

            const row = document.createElement("div");
            row.style.paddingLeft = needsIndent ? "20px" : "0px";
            //row.className = "combos1"; // preserve class from original
            row.appendChild(chk);
            row.appendChild(lbl);

            container.appendChild(row);
          }
        });
      }
    });

    activateNestedTab("General", "Environmental");
  }

  ////// Activate tab or nest tab  /////////////////////////

  function activateNestedTab(parentTabName, childTabName) {
    // Activate the parent tab first
    activateTabByName(parentTabName);

    // Wait to ensure the nested tabs are loaded
    setTimeout(() => {
      // Find all calcite-tabs inside active calcite-tabs
      const activeTab = document.querySelector(
        "calcite-tab[active] calcite-tabs"
      );

      // If nested calcite-tabs exist, activate the child tab
      if (activeTab) {
        activateTabByName(childTabName);
      }
    }, 500); // Adjust timeout as needed
  }

  function activateTabByName(tabName) {
    // Find all calcite-tab-title elements
    const tabTitles = document.querySelectorAll("calcite-tab-title");

    // Loop through tab titles to find the matching name
    tabTitles.forEach((tabTitle) => {
      if (tabTitle.textContent.trim() === tabName) {
        tabTitle.setAttribute("active", "true"); // Correct attribute for Calcite
        tabTitle.click(); // Simulate a user click to activate the tab
      } else {
        tabTitle.removeAttribute("active");
      }
    });
  }

  ////////////////// Close all widgets/components   ////////////////////////////////

  function close_widgets() {
    document
      .querySelectorAll("calcite-action[data-toggle-panel]")
      .forEach((action) => {
        leftpanels.forEach((panel) => {
          const open = panel.id === action.id;
          panel.closed = !open;
          panel.hidden = !open;
        });
      });

    document
      .querySelectorAll("calcite-action[data-action-id]")
      .forEach((action) => {
        rightpanels.forEach((panel) => {
          if (action.id != "") {
            // console.log(action.id)
          }
          const open = panel.id === action.id;
          panel.closed = !open;
          panel.hidden = !open;
        });
      });

    document.getElementById("BufferLayers").style.display = "none";
    document.getElementById("pegmanCaption").innerText = "Pegman is inactive";
    //document.getElementById("sketch_info").style.display = "none";

    //document.getElementById("pegmanCaption").innerText = "Pegman is inactive";

    arcgisMap.view.popup.visible = true;
    if (tab1.hasAttribute("selected")) {
      tab1.removeAttribute("selected");
      console.log("Tab1 deselected because click was outside tabs");
    }
    endShellPanel.collapsed = true;
    primaryShellPanel.collapsed = true;
    // main(view, 49);
    // full_table();
    clearFilter("no");
    if (mapClickEvent) {
      mapClickEvent.remove();
    }
    if (GoogleClickEvent) {
      GoogleClickEvent.remove();
      document.body.classList.remove("pegman-cursor");
    }
    // clearMeasurements();

    //selectedcomboboxquery_geom = null;

    // basemapGallery.visible = false;
    //legend.visible = false;
    // if (elevationProfile) {
    //   elevationProfile.visible = false;
    // }

    //layerList.visible = false;
    // if (mapClickEvent) {
    //   mapClickEvent.remove();
    // }
    // if (GoogleClickEvent) {
    //   GoogleClickEvent.remove();
    //   document.body.classList.remove("pegman-cursor");
    // }
    // document.getElementById("print_box").style.display = "none";
  }

  function clearFilter(mode) {
    // sketchGeometry = null;
    // filterGeometry = null;
    // filter = false;
    // sketchLayer.removeAll();
    // bufferLayer.removeAll();
    // if (table) {
    //   table.highlightIds.removeAll();
    // }
    // if (featureLayerView) {
    //   featureLayerView.filter = null;
    // }
    //if (table && mode === "yes") removeTable();
    document.getElementById("bufferNum").value = 0;
    document.getElementById("relationship-select").value = "disjoint";
  }

  ///////////////////////// Right Panel clicks //////////////////////////////
  open_addlayers_btn.addEventListener("click", function () {
    close_widgets();
    addlayers_panel.closed = false;
    addlayers_panel.hidden = false;
    endShellPanel.collapsed = false;
    endShellPanel.hidden = false;
    //document.getElementById("add_layers_panel").style.display = "block";
    load_layer_names("name");
  });
  addlayers_panel.addEventListener("calcitePanelClose", () => close_widgets());

  add_data_btn.addEventListener("click", function () {
    close_widgets();
    addata_panel.closed = false;
    addata_panel.hidden = false;
    addata_panel.style.display = "block";
    endShellPanel.collapsed = false;
    endShellPanel.hidden = false;
    //document.getElementById("add_layers_panel").style.display = "block";
  });
  addata_panel.addEventListener("calcitePanelClose", () => close_widgets());

  postmile_tools_btn.addEventListener("click", function () {
    close_widgets();
    postmile_tools();
    postmile_panel.closed = false;
    postmile_panel.hidden = false;
    postmile_panel.style.display = "block";
    endShellPanel.collapsed = false;
    endShellPanel.hidden = false;
  });
  postmile_panel.addEventListener("calcitePanelClose", () => close_widgets());

  Google_btn.addEventListener("click", function () {
    close_widgets();
    google_panel.closed = false;
    google_panel.hidden = false;
    google_panel.style.display = "block";
    endShellPanel.collapsed = false;
    endShellPanel.hidden = false;
  });
  google_panel.addEventListener("calcitePanelClose", () => close_widgets());

  //////////////////Add layers widget to add layers widget /////////////////////////////////////

  fetch(
    config_url
    // "./docs/config_id_AddLayer.json"
  )
    // Get layers count
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      layersCount = data.layers.length;

      layersCount_nowater = data.layers.filter(
        (entry) =>
          !entry.subject.includes("SLR") && !entry.subject.includes("Coastal")
      ).length;
      console.log(layersCount_nowater);

      total_layer_heading = `<span style=" font-weight: bold;font-size:medium">Add Library Layers. </span><span style="color: blue; font-weight: bold; font-size:small">Just ${layersCount} to choose from!</span> `;
      total_layer_heading_nowater = `<span style=" font-weight: bold;font-size:medium">Add Library Layers. </span><span style="color: blue; font-weight: bold; font-size:small">Just ${layersCount_nowater} to choose from!</span> `;

      console.log(layersCount);

      const headingElement = document.getElementById("custom-heading");
      headingElement.innerHTML = total_layer_heading;
    });

  /// populate Add Layer widget
  //window.addEventListener("DOMContentLoaded", async () => {
  await customElements.whenDefined("calcite-checkbox");
  const url = config_url;

  try {
    console.log("DOMContentLoaded started");
    const resp = await fetch(url);
    const json = await resp.json();

    json.layers.forEach((layer, i) => {
      const { subject, name } = layer;
      let layer_name = layer.name;
      let needsIndent =
        layer_name.includes("2025 - 2026 Projects (Current RTL) - Spot") ||
        layer_name.includes("Past Projects (Before Current FY RTL) - Spot") ||
        layer_name.includes("Future Projects (After Current FY RTL) - Spot") ||
        layer_name.includes("Other Projects (No RTL) - Spot") ||
        layer_name.includes("2025 - 2026 Projects (Current RTL) - Segment") ||
        layer_name.includes(
          "Past Projects (Before Current FY RTL) - Segment"
        ) ||
        layer_name.includes(
          "Future Projects (After Current FY RTL) - Segment"
        ) ||
        layer_name.includes("Other Projects (No RTL) - Segment");

      const tab = document.querySelector(`calcite-tab[id="${subject}"]`);
      if (!tab) {
        console.warn(`No tab found for subject="${subject}"`);
        return;
      }

      let container = tab.querySelector(".layer-checkboxes");
      if (!container) {
        container = document.createElement("div");
        container.className = "layer-checkboxes";
        tab.appendChild(container);
      }

      // const id = `chk-${name.replace(/\s+/g, "-").toLowerCase()}`;
      // const id = `chk-${name.replace(/\s+/g, "-").toLowerCase()}`;
      const chk = document.createElement("calcite-checkbox");
      chk.id = json.layers[i].name;
      chk.addEventListener("click", () => {
        // console.log(chk.id)
        // console.log(json.layers[i])
        // window.loadLayer(i);
        LoadLayer(json.layers[i]);
      });
      // chk.checked = visible;

      const lbl = document.createElement("label");
      lbl.setAttribute("for", chk.id);
      lbl.textContent = name;
      const row = document.createElement("div");
      row.style.paddingLeft = needsIndent ? "20px" : "0px";
      // if (needsIndent) {
      //   row.style.paddingLeft = "20px";
      // } else {
      //   row.style.paddingLeft = "0px";
      // }
      row.appendChild(chk);
      row.appendChild(lbl);
      container.appendChild(row);
    });
    console.log("DOMContentLoaded finished");
  } catch (err) {
    console.error("Error loading layers JSON:", err);
  }

  //// plot layer from clicked checkbox /////
  function LoadLayer(layer) {
    //console.log(layer)
    //   if (document.getElementById(thelayer.name).checked) {
    //console.log(document.getElementById(layer.name).checked)
    if (!document.getElementById(layer.name).checked) {
      var layerType = layer.type.toUpperCase();

      switch (layerType) {
        case "DYNAMIC":
          addDynamicLayerToMap(layer);
          break;
        case "FEATURE":
          addFeatureLayerToMap(layer);
          break;
        case "TILED":
          addTiledLayerToMap(layer);
          break;
        case "WMS":
          addWMSLayerToMap(layer);
          break;
        default:
          console.warn(
            "AddLayer :: addLayerToMap :: layer = ",
            layer,
            " has an unsupported type"
          );
          setErrorMessage(
            "The layer has invalid configuration and could not be added. Contact the administrator."
          );
          break;
      }
    } else {
      arcgisMap.view.map.layers.map(async function (lyr) {
        if (
          lyr.type === "map-image" &&
          (thelayer.type === "Dynamic" || thelayer.type === "Tiled")
        ) {
          // console.log(lyr.allSublayers);
          lyr.allSublayers.map((sublayer) => {
            // console.log(sublayer.id);
            let sublayerid_string = sublayer.id.toString();
            if (thelayer.visiblelayers.includes(sublayerid_string)) {
              sublayer.visible = false;
            }
          });
          arcgisMap.map.remove(lyr);
          return;
        } else {
          let fullurl = lyr.url + "/" + lyr.layerId;
          if (
            lyr.name === layer.name ||
            lyr.id === layer.name ||
            lyr.url === layer.url ||
            fullurl === layer.url
          ) {
            arcgisMap.map.remove(lyr);
            return;
          }
        }
      });
    }
  }

  function addFeatureLayerToMap(thelayer) {
    //console.log(thelayer.type + "  " + thelayer.url)
    const fl = new FeatureLayer({
      url: thelayer.url,
      name: thelayer.name || thelayer.title,
      outFields: ["*"],
    });

    if (fl.name) {
      fl.title = fl.name;
    }

    fl.load().then(() => {
      if (DIST_SELECTED !== "ALL") {
        var selection = "";
        const fieldNamesToCheck = ["DIST", "dist"];
        const layerFields = fl.fields.map((f) => f.name);

        const fieldFound = fieldNamesToCheck.some((field) => {
          if (layerFields.includes(field)) {
            selection = field;
            return true; // Stops further iterations
          }
          return false;
        });
        if (fieldFound) {
          var thedistrict = parseInt(DIST_SELECTED);
          fl.definitionExpression = `${selection} = ${thedistrict}`;
        }
      }
    });

    if (thelayer.hasOwnProperty("opacity")) {
      fl.opacity = thelayer.opacity;
    }
    if (thelayer.hasOwnProperty("visible") && !thelayer.visible) {
      fl.visible = false;
    } else {
      fl.visible = true;
    }

    if (
      thelayer.name &&
      thelayer.name.includes("Statewide Broadband Network")
    ) {
      let symbol = new SimpleLineSymbol({
        color: [0, 0, 255],
        width: 3,
        style: "solid",
      });

      renderer = new SimpleRenderer({
        symbol: symbol,
      });
    }

    if (thelayer.url.toUpperCase().includes("COSMOS")) {
      if (thelayer.name.toUpperCase().includes("CURRENT")) {
        var definitionQuery = "slr_meters=0";
      } else if (thelayer.name.includes("0.25")) {
        var definitionQuery = "slr_meters=0.25";
      } else if (thelayer.name.includes("0.50")) {
        var definitionQuery = "slr_meters=0.50";
      } else if (thelayer.name.includes("0.75")) {
        var definitionQuery = "slr_meters=0.75";
      } else if (thelayer.name.includes("1.00")) {
        var definitionQuery = "slr_meters=1.00";
      } else if (thelayer.name.includes("1.25")) {
        var definitionQuery = "slr_meters=1.25";
      } else if (thelayer.name.includes("1.50")) {
        var definitionQuery = "slr_meters=1.50";
      } else if (thelayer.name.includes("1.75")) {
        var definitionQuery = "slr_meters=1.75";
      } else if (thelayer.name.includes("2.00")) {
        var definitionQuery = "slr_meters= 2.00";
      } else if (thelayer.name.includes("2.50")) {
        var definitionQuery = "slr_meters= 2.50";
      } else if (thelayer.name.includes("3.00")) {
        var definitionQuery = "slr_meters= 3.00";
      } else if (thelayer.name.includes("5.00")) {
        var definitionQuery = "slr_meters= 5.00";
      }

      fl.definitionExpression = definitionQuery;
    }

    arcgisMap.map.add(fl);

    fl.load().then(() => {
      // console.log(fl.fields)
      if (renderer && !fl.renderer) {
        fl.renderer = renderer;
      }
      const fieldInfos = fl.fields.map((field) => ({
        fieldName: field.name,
        label: field.alias || field.name,
      }));
      fl.popupTemplate = {
        title: thelayer.name, // Customize with the appropriate field if available
        content: [
          {
            type: "fields",
            fieldInfos: fieldInfos,
          },
        ],
      };
    });
  }

  async function addDynamicLayerToMap(thelayer) {
    const layer = new MapImageLayer({
      url: thelayer.url,
      title: thelayer.name,
      //id: index,
    });

    var arr = [];
    arr.length = 0;
    arr = thelayer.visiblelayers.split(",");

    if (arr[0] === "") {
      //no sublayers
      layer.load().then(() => {
        arcgisMap.map.add(layer);
      });
    } else {
      arr.sort(function (a, b) {
        return b - a;
      });
      console.log(arr);

      arcgisMap.map.add(layer);
      await layer.loadAll();
      var thesublayer = null;
      layer.load().then(() => {
        layer.allSublayers.map((sublayer) => {
          sublayer.visible = false;
          sublayer.popupEnabled = true;
          if (DIST_SELECTED != "ALL") {
            var thedistrict = parseInt(DIST_SELECTED);
            sublayer.definitionExpression = "DIST =" + thedistrict;
          }
        });
        layer.sublayers.map((sublayer) => {
          for (let i = 0; i < arr.length; i++) {
            if (layer.id.includes("Shield")) {
              thesublayer = layer.findSublayerById(0);
            } else {
              thesublayer = layer.findSublayerById(Number(arr[i]));
            }
            thesublayer.visible = true;
            // console.log(thesublayer);
            const popupTemplate = thesublayer.createPopupTemplate();
            thesublayer.popupTemplate = popupTemplate;
            //console.log(thesublayer.popupTemplate);
          }
          if (sublayer.sublayers) {
            sublayer.sublayers.map((sublayer1) => {
              sublayer1.popupEnabled = true;
              for (let j = 0; j < arr.length; j++) {
                if (sublayer1.id === Number(arr[j])) {
                  // sublayer1.visible = true;
                  sublayer.visible = true;
                }
              }
            });
          }
        });
      });
    }
  }

  ////////// search for layers /////////////////////////////////////////////////

  async function load_layer_names(property) {
    document.getElementById("layer_search").value = null;
    var layer_selection = document.getElementById("layer_search");
    try {
      const response = await fetch(config_url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const jsonData = await response.json();
      const extractedValues = jsonData.layers.map((item) => item[property]);
      //  console.log(extractedValues); // Output: ["Alice", "Bob", "Charlie"]
      for (let item of extractedValues) {
        //console.log(item)
        const comboItem = document.createElement("calcite-combobox-item");
        comboItem.setAttribute("value", item);
        comboItem.setAttribute("text-label", item);
        layer_selection.appendChild(comboItem);
      }
    } catch (error) {
      console.error("Error fetching JSON:", error);
    }
  }
  document
    .getElementById("layer_search")
    .addEventListener("calciteComboboxChange", function (event) {
      var layerName = document.getElementById("layer_search").value;
      openTabsByName(layerName, config_url);
    });

  async function openTabsByName(targetName, jsonUrl) {
    try {
      // Step 1: Fetch JSON data
      const response = await fetch(jsonUrl);
      const jsonData = await response.json();

      // Step 2: Find the object with the target name
      const foundObject = jsonData.layers.find(
        (item) => item.name === targetName
      );

      if (!foundObject) {
        console.error(`No entry found for name: ${targetName}`);
        return;
      }

      var subject = foundObject.subject;
      var district = foundObject.dist;

      // Example Usage
      const tabHierarchy = listTopLevelTabsAndChildren();
      // console.log("Hierarchy of Tabs and Their Children:", tabHierarchy);

      for (const item of tabHierarchy) {
        // console.log(item.parent + "  " + item.children);
        if (item.children.includes(subject)) {
          const parent = item.parent;
          //   console.log(parent);
          if (subject.includes("specific")) {
            DIST_SELECTED = district;
            await handleAddLayersWidgetClick(district);
            console.log(parent + ",  " + subject);
            await activateNestedTab(parent, subject);
          } else {
            activateNestedTab(parent, subject);
          }

          return;
        }
      }

      // activateNestedTab("Biology", "Fish");
    } catch (error) {
      console.error("Error occurred while processing tabs:", error);
    }
  }
  function listTopLevelTabsAndChildren() {
    // Find the top-level calcite-tabs group
    const topLevelTabsElement = document.querySelector("#tab-layers");
    if (!topLevelTabsElement) {
      console.error("Top-level calcite-tabs group not found.");
      return;
    }

    // console.log("Top-Level Tabs Group Found:", topLevelTabsElement);

    // Collect all top-level calcite-tab-title elements
    const topLevelTabTitles = Array.from(
      topLevelTabsElement.querySelectorAll("calcite-tab-title")
    ).filter((title) => {
      return (
        title.offsetParent !== null && // Ensure visibility
        !title.closest("calcite-tab") // Exclude child tabs
      );
    });

    // console.log("Filtered Top-Level Tab Titles:", topLevelTabTitles.map((title) => title.textContent.trim()));

    // Prepare a mapping of top-level tab titles and their children
    const tabHierarchy = topLevelTabTitles.map((topTitle) => {
      const topTitleText = topTitle.textContent.trim();

      // Locate the associated calcite-tab for this title
      const associatedTabId = topTitle.getAttribute("id");
      const associatedTab = topLevelTabsElement.querySelector(
        `[aria-labelledby="${associatedTabId}"]`
      );

      // Collect child calcite-tab-title elements inside the associated tab
      const childTabTitles = associatedTab
        ? Array.from(associatedTab.querySelectorAll("calcite-tab-title")).map(
            (childTitle) => childTitle.textContent.trim()
          )
        : [];

      return {
        parent: topTitleText,
        children: childTabTitles,
      };
    });

    // Log the hierarchy
    //console.log("Tab Hierarchy:", tabHierarchy);

    return tabHierarchy;
  }

  // Function to activate nested tabs dynamically

  async function activateNestedTab(parentTabName, childTabName) {
    // Activate the parent tab first
    activateTabByName(parentTabName);

    // Wait to ensure the nested tabs are loaded
    setTimeout(() => {
      // Find all calcite-tabs inside active calcite-tabs
      const activeTab = document.querySelector(
        "calcite-tab[active] calcite-tabs"
      );

      // If nested calcite-tabs exist, activate the child tab
      if (activeTab) {
        activateTabByName(childTabName);
      }
    }, 500); // Adjust timeout as needed
  }

  function activateTabByName(tabName) {
    // Find all calcite-tab-title elements
    const tabTitles = document.querySelectorAll("calcite-tab-title");

    // Loop through tab titles to find the matching name
    tabTitles.forEach((tabTitle) => {
      if (tabTitle.textContent.trim() === tabName) {
        tabTitle.setAttribute("active", "true"); // Correct attribute for Calcite
        tabTitle.click(); // Simulate a user click to activate the tab
      } else {
        tabTitle.removeAttribute("active");
      }
    });
  }

  //// Add date widget
  document
    .getElementById("theAddDatatabs")
    .addEventListener("calciteTabChange", function (event) {
      // clear_entries();
      arcgisMap.view.popup.visible = true;
      if (tab1.hasAttribute("selected")) {
      tab1.removeAttribute("selected");
      console.log("Tab1 deselected because click was outside tabs");
    }
      //clear_form_input();
      clear_buffer_lys();
      //console.log(document.getElementById("pm_tools_tabs").style.display);
      if (document.getElementById("add-data-panel").style.display === "block") {
        // console.log(event.target.selectedTitle);
        if (event.target.selectedTitle.tab === "Add URL") {
          document.getElementById("add_FL").checked = false;
          document.getElementById("add_CSV_URL").checked = false;
          document.getElementById("add_KML_URL").checked = false;
          document.getElementById("add_WebLayers").checked = false;
          document.getElementById("get_file").style.display = "none";
        } else {
          document.getElementById("status").innerText = "";
          clearFileInput();
          document.getElementById("get_WebMap_Layers").style.display = "none";
          document.getElementById("get_CSV_URL").style.display = "none";
          document.getElementById("get_KML_URL").style.display = "none";
          document.getElementById("get_FL_URL").style.display = "none";
          document.getElementById("get_file").style.display = "block";
        }
      }
    });

  function clear_buffer_lys() {
    arcgisMap.view.graphics.removeAll();
    // arcgisMap.view.map.layers.map(async function (lyr) {
    //   if (lyr.url && !lyr.url.includes("Districts_w_StateOutline")) {
    //     arcgisMap.map.remove(lyr);
    //   }
    // });
    arcgisMap.view.map.layers.map(function (lyr) {
    console.log(lyr.id);
    if (
   //   lyr.id === "PM Point" ||
    //  lyr.id === "PM Segment" ||
      
      lyr.id.includes("Buffer")
    ) {
      arcgisMap.map.remove(lyr);
    }
    });
  }
  document
    .getElementById("fileInput")
    .addEventListener("change", function (event) {
      //const fileName = event.target.value.toLowerCase();
      console.log(event);
      const file = event.target.files[0];
      handleFileUpload(file);
    });

  function clearFileInput() {
    const fileInput = document.getElementById("fileInput");
    fileInput.value = ""; // Clear the selected file
  }

  // Function to handle file upload
  function handleFileUpload(file) {
    if (file) {
      document.getElementById(
        "status"
      ).innerText = `File "${file.name}" uploaded successfully! Size: ${file.size} bytes`;

      if (file.name.indexOf(".zip") !== -1) {
        //is file a zip - if not notify user
        //generateFeatureCollection(file);
        addShapefileToMap(file);
        // } else if (file.name.indexOf(".json") !== -1) {
        //   document.getElementById("loadingOverlay3").style.display = "block";
        //   addJSONToMap(file);
      } else if (file.name.indexOf(".csv") !== -1) {
        addCSVfileToMap(file);
      } else if (file.name.indexOf(".kml") !== -1) {
        addKMLfileToMap(file);
      } else {
        document.getElementById("status").innerHTML =
          '<p style="color:red">Not a valid file added!</p>';
      }
    }

    function addKMLfileToMap(file) {
      console.log(file);

      const reader = new FileReader();
      // const fileUrl = URL.createObjectURL(file); // Create a temporary URL for the local file
      reader.onload = function (e) {
        const kmlText = e.target.result;

        // Convert KML to GeoJSON using toGeoJSON library
        const parser = new DOMParser();
        const kmlDoc = parser.parseFromString(kmlText, "text/xml");
        const geojson = toGeoJSON.kml(kmlDoc);

        // Separate features by geometry type
        const pointFeatures = [];
        const lineFeatures = [];
        const polygonFeatures = [];

        geojson.features.forEach((feature, index) => {
          if (feature.geometry.type === "GeometryCollection") {
            // Flatten GeometryCollection into individual geometries
            feature.geometry.geometries.forEach((geometry) => {
              addFeature(geometry, feature.properties, index);
            });
          } else {
            addFeature(feature.geometry, feature.properties, index);
          }
        });

        // Helper function to add features to the appropriate array
        function addFeature(geometry, properties, index) {
          let arcgisGeometry;

          switch (geometry.type) {
            case "Point":
              arcgisGeometry = new Point({
                x: geometry.coordinates[0],
                y: geometry.coordinates[1],
              });
              pointFeatures.push({
                geometry: arcgisGeometry,
                attributes: {
                  ObjectID: index,
                  ...properties,
                },
              });
              break;

            case "LineString":
              arcgisGeometry = new Polyline({
                paths: [geometry.coordinates],
              });
              lineFeatures.push({
                geometry: arcgisGeometry,
                attributes: {
                  ObjectID: index,
                  ...properties,
                },
              });
              break;

            case "Polygon":
              arcgisGeometry = new Polygon({
                rings: geometry.coordinates,
              });
              polygonFeatures.push({
                geometry: arcgisGeometry,
                attributes: {
                  ObjectID: index,
                  ...properties,
                },
              });
              break;

            default:
              console.warn("Unsupported geometry type:", geometry.type);
          }
        }

        // Create FeatureLayers for each geometry type
        if (pointFeatures.length > 0) {
          const fieldInfos = Object.entries(pointFeatures[0].attributes).map(
            ([key, value]) => ({
              fieldName: key,
              label: value.alias || key,
            })
          );
          const validFields = Object.entries(pointFeatures[0].attributes)
            .filter(([key]) => key.toLowerCase() !== "shape") // Remove Shape if invalid
            .map(([key, value]) => ({
              name: key,
              alias: value.alias || key, // Use alias if available
              type: mapFieldType(value.type), // Assuming type is stored in value
            }));

          var layer_name = file.name + " - Point Layer";

          const pointLayer = new FeatureLayer({
            title: layer_name,
            source: pointFeatures,
            objectIdField: "ObjectID",
            geometryType: "point",
            fields: validFields,
            renderer: {
              type: "simple",
              symbol: new SimpleMarkerSymbol({
                color: [255, 0, 0, 1], // Red color
                size: 8,
                outline: {
                  color: [255, 255, 255, 1], // White outline
                  width: 1,
                },
              }),
            },
            popupTemplate: {
              title: "KML Point Feature",
              content: [
                {
                  type: "fields",
                  fieldInfos: fieldInfos,
                },
              ],
            },
          });
          arcgisMap.map.add(pointLayer);
          notifyusers();
          pointLayer
            .when(() => {
              return pointLayer.queryExtent();
            })
            .then((response) => {
              arcgisMap.view.goTo({
                target: pointFeatures,
              });
              arcgisMap.view.zoom = 20;
            });
        }

        if (lineFeatures.length > 0) {
          const fieldInfos = Object.entries(lineFeatures[0].attributes).map(
            ([key, value]) => ({
              fieldName: key,
              label: value.alias || key,
            })
          );
          const validFields = Object.entries(lineFeatures[0].attributes)
            .filter(([key]) => key.toLowerCase() !== "shape") // Remove Shape if invalid
            .map(([key, value]) => ({
              name: key,
              alias: value.alias || key, // Use alias if available
              type: mapFieldType(value.type), // Assuming type is stored in value
            }));
          var layer_name = file.name + " - Line Layer";

          const lineLayer = new FeatureLayer({
            title: layer_name,
            source: lineFeatures,
            objectIdField: "ObjectID",
            geometryType: "polyline",
            fields: validFields,
            renderer: {
              type: "simple",
              symbol: new SimpleLineSymbol({
                color: [255, 0, 0, 1], // Red color
                width: 3,
              }),
            },
            popupTemplate: {
              title: "KML Line Feature",
              content: [
                {
                  type: "fields",
                  fieldInfos: fieldInfos,
                },
              ],
            },
          });
          arcgisMap.map.add(lineLayer);
          notifyusers();
          lineLayer
            .when(() => {
              return lineLayer.queryExtent();
            })
            .then((response) => {
              arcgisMap.view.goTo({
                target: lineFeatures,
              });
              arcgisMap.view.zoom = 20;
            });
        }

        if (polygonFeatures.length > 0) {
          const fieldInfos = Object.entries(polygonFeatures[0].attributes).map(
            ([key, value]) => ({
              fieldName: key,
              label: value.alias || key,
            })
          );
          const validFields = Object.entries(polygonFeatures[0].attributes)
            .filter(([key]) => key.toLowerCase() !== "shape") // Remove Shape if invalid
            .map(([key, value]) => ({
              name: key,
              alias: value.alias || key, // Use alias if available
              type: mapFieldType(value.type), // Assuming type is stored in value
            }));
          var layer_name = file.name + " - Polygon Layer";
          const polygonLayer = new FeatureLayer({
            title: layer_name,
            source: polygonFeatures,
            objectIdField: "ObjectID",
            geometryType: "polygon",
            fields: validFields,
            renderer: {
              type: "simple",
              symbol: new SimpleFillSymbol({
                color: [255, 0, 0, 0.5], // Red color with 50% opacity
                outline: {
                  color: [255, 0, 0, 1], // Red outline
                  width: 2,
                },
              }),
            },
            popupTemplate: {
              title: "KML Polygon Feature",
              fieldInfos: fieldInfos,
            },
          });
          arcgisMap.map.add(polygonLayer);
          notifyusers();
          polygonLayer
            .when(() => {
              return polygonLayer.queryExtent();
            })
            .then((response) => {
              arcgisMap.view.goTo({
                target: polygonFeatures,
              });
              arcgisMap.view.zoom = 20;
            });
        }
      };
      reader.readAsText(file);
    }

    function addCSVfileToMap(file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const csvData = e.target.result;
        // Create a Blob and generate an object URL for it
        const blob = new Blob([csvData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        // Create the CSVLayer with the blob URL
        const csvLayer = new CSVLayer({
          url: url,
          title: "Local CSV Layer",
        });

        csvLayer
          .load()
          .then(() => {
            // Generate a dynamic popup template
            const fields = csvLayer.fields.map((field) => field.name);
            const popupContent = fields
              .map((field) => `<b>${field}:</b> {${field}}<br>`)
              .join("");

            csvLayer.popupTemplate = {
              title: "{name}", // Customize with the appropriate field if available
              content: popupContent,
            };

            // Add the CSVLayer to the map
            arcgisMap.map.add(csvLayer);
          })
          .catch((error) => {
            console.error("Error loading CSV Layer:", error);
          });
      };

      reader.readAsText(file);
    }

    function addShapefileToMap(file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const arrayBuffer = event.target.result;

        // Use shp2geojson to convert the shapefile to GeoJSON
        shp(arrayBuffer)
          .then((geojson) => {
            // Create features from GeoJSON
            const features = geojson.features.map((feature, index) => {
              const geometryType = feature.geometry.type.toLowerCase();

              // Determine the ArcGIS geometry type based on GeoJSON geometry
              let arcgisGeometry;
              if (geometryType === "point") {
                arcgisGeometry = {
                  type: "point",
                  longitude: feature.geometry.coordinates[0],
                  latitude: feature.geometry.coordinates[1],
                };
              } else if (
                geometryType === "linestring" ||
                geometryType === "multilinestring"
              ) {
                arcgisGeometry = {
                  type: "polyline",
                  paths: feature.geometry.coordinates,
                };
              } else if (
                geometryType === "polygon" ||
                geometryType === "multipolygon"
              ) {
                arcgisGeometry = {
                  type: "polygon",
                  rings: feature.geometry.coordinates[0],
                };
              }

              return new Graphic({
                geometry: arcgisGeometry,
                attributes: { ObjectID: index, ...feature.properties },
              });
            });

            // Dynamically create fields from GeoJSON properties
            const fields = Object.keys(features[0].attributes).map(
              (attribute) => ({
                name: attribute,
                alias: attribute,
                type: attribute === "ObjectID" ? "oid" : "string",
              })
            );

            // Generate a popup template to show all attributes
            const popupTemplate = {
              title: "Feature {ObjectID}",
              content: Object.keys(features[0].attributes)
                .map((key) => {
                  return `<b>${key}:</b> {${key}}<br>`;
                })
                .join(""),
            };

            // Create FeatureLayer
            const featureLayer = new FeatureLayer({
              title: "Imported SHP file",
              source: features, // Set the features array
              fields: fields, // Set fields based on properties
              objectIdField: "ObjectID",
              geometryType: features[0].geometry.type, // Set appropriate geometry type
              spatialReference: { wkid: 4326 },
              popupTemplate: popupTemplate, // Attach popup template
            });

            arcgisMap.map.add(featureLayer);
            notifyusers();
          })
          .catch((error) => {
            console.error("Error converting shapefile to JSON:", error);
          });
      };

      reader.readAsArrayBuffer(file);
    }
  }

  document
    .getElementById("add_data_option")
    .addEventListener("calciteRadioButtonGroupChange", function (event) {
      actionAddData(event);
    });

  function actionAddData(event) {
    //clear_entries();
    arcgisMap.view.popup.visible = false;
    // console.log(event.target.selectedItem.value);
    var allinput = document.getElementsByTagName("calcite-input");
    for (let i = 0; i < allinput.length; i++) {
      allinput[i].value = "";
    }
    if (event.target.selectedItem.value === "CSV_URL") {
      document.getElementById("get_CSV_URL").style.display = "block";
      document.getElementById("get_KML_URL").style.display = "none";
      document.getElementById("get_FL_URL").style.display = "none";
      document.getElementById("get_WebMap_Layers").style.display = "none";
    } else if (event.target.selectedItem.value === "FL") {
      document.getElementById("get_CSV_URL").style.display = "none";
      document.getElementById("get_KML_URL").style.display = "none";
      document.getElementById("get_FL_URL").style.display = "block";
      document.getElementById("get_WebMap_Layers").style.display = "none";
    } else if (event.target.selectedItem.value === "KML_URL") {
      document.getElementById("get_CSV_URL").style.display = "none";
      document.getElementById("get_KML_URL").style.display = "block";
      document.getElementById("get_FL_URL").style.display = "none";
      document.getElementById("get_WebMap_Layers").style.display = "none";
    } else if (event.target.selectedItem.value === "WebMap") {
      document.getElementById("get_CSV_URL").style.display = "none";
      document.getElementById("get_KML_URL").style.display = "none";
      document.getElementById("portal_URL").value = "";
      document.getElementById("portal_id").value = "";
      document.getElementById("get_FL_URL").style.display = "none";
      document.getElementById("get_WebMap_Layers").style.display = "block";
    }
  }


  ////functions used by multiple widgets

    function clearcombobox(comboname) {
    var allcombo = document.getElementsByTagName("calcite-combobox");
    for (let j = 0; j < allcombo.length; j++) {
      //  console.log(allcombo[j].id);
      if (allcombo[j].id === comboname) {
        document.getElementById(allcombo[j].id).value = null;
        document.getElementById(allcombo[j].id).innerText = "";
      }
    }
  }

  ///// Postmile Tools /////////////////

  document
    .getElementById("add_10thpm_layer")
    .addEventListener("click", function (event) {
      const checkbox = document.getElementById("add_10thpm_layer");
      console.log(checkbox.checked);
      if (checkbox.checked) {
        const PMFL = new FeatureLayer(
          "https://caltrans-gis.dot.ca.gov/arcgis/rest/services/CHhqenvi/DEA_Postmiles/MapServer/0"
        );
        document.getElementById("add_10thpm_layer").checked = true;
        arcgisMap.map.add(PMFL);
        notifyusers();
      } else {
        arcgisMap.view.map.layers.forEach((layer) => {
          console.log(layer);
          if (layer.url && layer.url.includes("DEA_Postmiles")) {
            arcgisMap.map.remove(layer);
            document.getElementById("add_10thpm_layer").checked = false;
          }
        });
      }

      // document.getElementById("Caltras_district_choice").style.display = "none";
    });

  function postmile_tools() {
    listCounties();
    document.getElementById("postmile-panel").style.display = "block";
    document.getElementById("segment_radioPM").checked = false;
    document.getElementById("spot_radioPM").checked = false;
  //  document.getElementById("segment_radioXY").checked = false;
 //   document.getElementById("spot_radioXY").checked = false;
  }

  function listCounties() {
    clear_entries();
    arcgisMap.view.popup.visible = false;

    countyselection = document.getElementById("beg_county");

    routeselection = document.getElementById("route");
    routeselection.length = 0;

    var options = {
      query: {
        f: "json",
      },
      responseType: "json",
    };

    esriRequest("./CountyRouteRanges.json", options)
      .then((response) => {
        thedata = response.data;
        let countylist = [];
        for (var prop in thedata) {
          if (thedata.hasOwnProperty(prop)) {
            countylist.push({
              label: prop,
              value: prop,
            });
          }
        }
        //   countylist = countylist.slice(0, -1);
        let temp = [];
        temp = countylist;
        temp.sort(function (a, b) {
          if (a.label < b.label) return -1;
          if (a.label > b.label) return 1;
          return 0;
        });
        countylist = temp;

        for (let items of countylist) {
          const comboItem = document.createElement("calcite-combobox-item");
          comboItem.setAttribute("value", items.value);
          comboItem.setAttribute("text-label", items.label);
          countyselection.appendChild(comboItem);
        }
      })
      .catch((err) => {
        console.error("Error encountered", err);
      });
  }

  document
    .getElementById("thetabs")
    .addEventListener("calciteTabChange", function (event) {
      clear_entries();
      clear_entries_PM();
      arcgisMap.view.closePopup();
      //clear_form_input();
      clear_buffer_lys();
      //console.log(document.getElementById("pm_tools_tabs").style.display);
      document.getElementById("BufferLayers").style.display = "none";
      if (document.getElementById("postmile-panel").style.display === "block") {
        // console.log(event.target.selectedTitle);
        if (event.target.selectedTitle.tab === "PM from Click") {
          arcgisMap.view.popup.visible = false;
          arcgisMap.view.closePopup();
          enablePMMapClick();
        } else {
          arcgisMap.view.popup.visible = true
          if (event.target.selectedTitle.tab === "PM to XY") {
           arcgisMap.view.popup.visible = true;
            document.getElementById("segment_radioPM").checked = false;
            document.getElementById("spot_radioPM").checked = false;
            // document.getElementById("segment_radioXY").checked = false;
            // document.getElementById("spot_radioXY").checked = false;
            disablePMMapClick();
            // listCounties();
          }
          // if (event.target.selectedTitle.tab === "XY to PM") {
          //   arcgisMap.view.popup.visible = true;
          //   document.getElementById("segment_radioPM").checked = false;
          //   document.getElementById("spot_radioPM").checked = false;
          //   document.getElementById("segment_radioXY").checked = false;
          //   document.getElementById("spot_radioXY").checked = false;
          //   disablePMMapClick();
          //   getPMfromXY();
          // }
          if (event.target.selectedTitle.tab === "Co Rte") {
            document.getElementById("rte_county").value = null;
            document.getElementById("rte_route").value = null;
            listCounties_Rte();
          }
        }
      }
    });

  function clear_entries_PM() {
    document.getElementById("beg_county").value = null;
    document.getElementById("route").value = null;
    document.getElementById("route_suffix").value = null;
    document.getElementById("align").value = null;
    document.getElementById("beg_PMPrefix").value = null;
    document.getElementById("Begin_PM").value = null;
    document.getElementById("beg_PMSuffix").value = null;
    document.getElementById("end_county").value = null;
    document.getElementById("end_PMPrefix").value = null;
    document.getElementById("End_PM").value = null;
    document.getElementById("end_PMSuffix").value = null;
    document.getElementById("buffer_dist_sel").style.display = "none";
    buffer_checkbox.checked = false;
    document.getElementById("BufferLayers").style.display = "none";
    document.getElementById("ranges_display").style.display = "none";
    document.getElementById("ranges").innerHTML = "";
  }

  var buffer_checkbox = document.getElementById("buffer_checked?");
  buffer_checkbox.checked = false;

  buffer_checkbox.addEventListener("calciteCheckboxChange", () => {
    console.log(buffer_checkbox.checked);
    if (document.getElementById("buffer_dist_sel").style.display === "block") {
      document.getElementById("buffer_dist_sel").style.display = "none";
      buffer_checkbox.checked = false;
    } else {
      document.getElementById("buffer_dist_sel").style.display = "block";
      buffer_checkbox.checked = true;
    }
  });

  function clear_entries() {
    //view.popup.autoOpenEnabled = false;
    //view.popup.close()
    //remove visibility of all options
    document.getElementById("spot_PM").style.display = "none";
    document.getElementById("action_PM").style.display = "none";
 //   document.getElementById("spot_XY").style.display = "none";
 //   document.getElementById("action_XY").style.display = "none";

   // document.getElementById("ending_XYinfo").style.display = "none";
    document.getElementById("ending_PMinfo").style.display = "none";

    document.getElementById("add-data-panel").style.display = "none";
    document.getElementById("query-attrs-panel").style.display = "none";
    document.getElementById("query-geom-panel").style.display = "none";
    document.getElementById("session-panel").style.display = "none";
    document.getElementById("measurement-panel").style.display = "none";
    document.getElementById("sketch-panel").style.display = "none";
    document.getElementById("google-panel").style.display = "none";
    document.getElementById("elevation-panel").style.display = "none";
    // document.getElementById("basemaps-panel").style.display = "none";
    // document.getElementById("legend-panel").style.display = "none";
    document.getElementById("layerlist-panel").style.display = "none";
    document.getElementById("ranges_display").style.display = "none";
    document.getElementById("ranges").innerHTML = "";

    // remove all popups
    // document.getElementById("ranges_display").style.display = "none";
    // document.getElementById("ranges").innerHTML = "";
    // document.getElementById("thepopup").style.display = "none";
    // document.getElementById("thepopup_msg").innerHTML = "";

    //Remove click on map place a point graphic
    if (mapClickEvent) {
      mapClickEvent.remove();
      arcgisMap.view.map.layers.forEach((layer) => {
        // console.log(layer);
        if (layer.title && layer.title.includes("Caltrans Districts")) {
          layer.popupEnabled = true;
        }
      });
    }

    //Clear Radio buttons for PM widget
    // document.getElementById("segment_radioPM").checked =false
    // document.getElementById("spot_radioPM").checked=false
    // document.getElementById("segment_radioXY").checked =false
    // document.getElementById("spot_radioXY").checked=false
  }

  function enablePMMapClick() {
    clear_entries();
    

    // view.map.layers.forEach((layer) => {
    //   //console.log(layer);
    //   if (layer.title && layer.title.includes("Caltrans Districts")) {
    //     layer.popupEnabled = false;
    //   }
    // });
    mapClickEvent = arcgisMap.view.on("click", function (evt) {
      const { mapPoint } = evt;
      arcgisMap.view.popup.visible = false;
      // view.popup.autoOpenEnabled = false;
      // view.closePopup();
      if (notice) {
        notice.open = false;
      }
      var graphic = new Graphic({
        geometry: {
          type: "point",
          latitude: evt.mapPoint.latitude,
          longitude: evt.mapPoint.longitude,
          spatialReference: arcgisMap.view.spatialReference,
        },
        symbol: {
          type: "picture-marker",
          url: "https://static.arcgis.com/images/Symbols/Animated/EnlargeRotatingRedMarkerSymbol.png",
          height: "20px",
          width: "20px",
        },
      });
      arcgisMap.view.graphics.add(graphic);
      computePM_from_ClickedPoint(mapPoint);
    });
  }

  ////  PostMie Click on MAP  ////////////////////////////////////
  window.computePM_from_ClickedPoint = function (screenPoint) {
    arcgisMap.view.popup.visible = false;
    arcgisMap.view.closePopup();
    // console.log(screenPoint);
    console.log(screenPoint)
    var mp = webMercatorUtils.webMercatorToGeographic(screenPoint);
    // console.log(mp.x.toFixed(5) + ", " + mp.y.toFixed(5));

    const locations = [
      {
        geometry: {
          x: screenPoint.x,
          y: screenPoint.y,
          // "x":-13046046.143701032,
          // "y":3878000.216743852
        },
      },
    ];

    // tol = registry.byId('click_tol').get('displayedValue');
    tol = document.getElementById("click_tol").value;
    // console.log(tol);
    if (!tol) {
      thetolerance = "&tolerance=30.48";
    } else {
      let convertToMeter = tol / 3.28084;
      thetolerance = "&tolerance=" + convertToMeter;
    }

    //console.log(encodeURIComponent(JSON.stringify(locations)));
    let theurl =
      url_prefix +
      "/exts/LRServer/networkLayers/0/geometryToMeasure"
        .concat("?f=json")
        .concat("&locations=", encodeURIComponent(JSON.stringify(locations)))
        .concat(thetolerance)
        .concat("&inSR=3857")
        .concat("&outSR=3857");

    //console.log(theurl);

    var options = {
      query: {
        f: "json",
      },
      responseType: "json",
    };

    esriRequest(theurl, options)
      .then((response) => {
        // console.log(response);
        plotpoint(response);
        // The request went OK
      })
      .catch((err) => {
        console.error("Error encountered", err);
      });
  };

  function plotpoint(response) {
    if (response.data.locations[0].results.length === 0) {
      document.getElementById("Message_html").innerHTML =
        "There are no locations found. \nIncrease the tolerance.";
      notice.open = true;
      return;
    }

    if (response.data.locations[0].results.length > 6) {
      document.getElementById("Message_html").innerHTML =
        "There are more than 5 locations found. \nReduce the tolerance.";
      notice.open = true;
      return;
    }

    if (
      response.data.locations[0].status.includes("CannotFind") &&
      data.locations.length === 1
    ) {
      document.getElementById("search_results").innerHTML =
        "<span style='color:red'><b>No Location can be found!</b></span>";
    } else {
      if (response.data.locations[0].results.length > 0) {
        var content = "";
        // var the_elevation = "";
        for (var key in response.data.locations[0].results) {
          var part = response.data.locations[0].results[key];
          // console.log(part);
          var foundPM = part.measure;
          var therouteID = part.routeId;
          var value = webMercatorUtils.xyToLngLat(
            part.geometry.x,
            part.geometry.y
          );
          var thecoords = value;
          //console.log(value);

          // Get Elevation
          // console.log(the_elevation);

          // console.log(therouteID);
          var theCounty = therouteID.substring(0, 3);
          var theRoute = therouteID.substring(3, 6);
          var theRouteSuffix = therouteID.substring(6, 7);
          var thePMPrefix = therouteID.substring(7, 8);
          var thePMSuffix = therouteID.substring(8, 9);
          var thealignment = therouteID.substring(9);

          content += "<br>";

          content += "Route ID: " + therouteID + "<br>";
          content += "County: " + theCounty + "<br>";
          content += "Route: " + theRoute + "<br>";
          content += "Postmile: " + foundPM.toFixed(3) + "<br>";
          content += "Route Suffix: " + theRouteSuffix + "<br>";
          content += "PM Prefix: " + thePMPrefix + "<br>";
          content += "PM Suffix: " + thePMSuffix + "<br>";
          content += "Alignment: " + thealignment + "<br>";
          content += "Lat: " + thecoords[1].toFixed(7) + "<br>";
          content += "Long: " + thecoords[0].toFixed(7) + "<br>";
          // content +=
          //   "<span style='color:red'>Elevation: </span>" +
          //   the_elevation +
          //   " feet<br>";

          const lon = thecoords[0].toFixed(7);
          const lat = thecoords[1].toFixed(7);

          var thePoint = new Point(
            thecoords,
            new SpatialReference({
              wkid: 4326,
            })
          );

      //    if (document.getElementById("spot_radioXY").checked) {
       //     var thetitle = "PM Spot from XY";
       //   } else {
            var thetitle = "Nearest Clicked Location";
        //  }

          var thegraphic = new Graphic({
            geometry: thePoint,
            symbol: pointSymbol,
            attributes: { lon, lat },
            popupTemplate: {
              title: thetitle,
              content: content,
            },
          });

          const graphics = [thegraphic];
         
          PMClickedgraphics.add(thegraphic);
          arcgisFeatures.open({ features: graphics });          
        
          primaryShellPanel.collapsed = false;

        
        }
      }
    }
  }

  tab1.addEventListener("click",() => {
  // if (tab1.hasAttribute("selected")) {
      tab1.selected = true;
  // }
      
 })

 // disable click by "PM from Click"
   function disablePMMapClick() {
    clear_entries();
     arcgisMap.view.popup.visible = true;
    arcgisMap.view.closePopup();

    if (mapClickEvent) {
      mapClickEvent.remove();
    }
  }


function actionPMtoXY(event) {
    clear_entries();
    arcgisMap.view.closePopup();
    var allcombo = document.getElementsByTagName("calcite-combobox");
    var allinput = document.getElementsByTagName("calcite-input");
    document.getElementById("ranges_display").style.display = "none";
    document.getElementById("ranges").innerHTML = "";
    //console.log(event.target.selectedItem.value);
    //console.log(document.getElementById("beg_county").value.length)

    if (event.target.selectedItem.value === "Spot") {
      document.getElementById("beg_county").value = "";
      document.getElementById("route").value = "";
      document.getElementById("spot_PM").style.display = "block";
      document.getElementById("ending_PMinfo").style.display = "none";
      document.getElementById("action_PM").style.display = "block";
    } else {
      document.getElementById("spot_PM").style.display = "block";
      document.getElementById("ending_PMinfo").style.display = "block";
      document.getElementById("action_PM").style.display = "block";
    }
    if (document.getElementById("beg_county").value.length > 0)
      for (let j = 0; j < allcombo.length; j++) {
        if (document.getElementById(allcombo[j].id)) {
          document.getElementById(allcombo[j].id).value = null;
        }
      }
    for (let i = 0; i < allinput.length; i++) {
      allinput[i].value = "";
    }
  }

  document
    .getElementById("clear_entries")
    .addEventListener("click", function (event) {
      clear_entries_PM();
    });

    document
    .getElementById("clear_buffer_lys")
    .addEventListener("click", function (event) {
      clear_buffer_lys(event);
    });

    document
    .getElementById("rte_county")
    .addEventListener("calciteComboboxChange", function (event) {
      //  RteByCographics.removeAll();
      //  document.getElementById("rte_route").innerText = null;
      listRoutesByCo(event);
    });
  document
    .getElementById("rte_route")
    .addEventListener("calciteComboboxChange", function (event) {
      showRoutesByCo(event);
    });

  document
    .getElementById("beg_county")
    .addEventListener("calciteComboboxChange", function (event) {
      document.getElementById("Begin_PM").value = null;
      document.getElementById("End_PM").value = null;
      document.getElementById("beg_PMPrefix").value = null;
      document.getElementById("route_suffix").value = null;
      document.getElementById("beg_PMSuffix").value = null;
      listRoutes(event);
    });
  document
    .getElementById("end_county")
    .addEventListener("calciteComboboxChange", function (event) {
      get_ranges(document.getElementById("end_county").value);
    });
  document
    .getElementById("align")
    .addEventListener("calciteComboboxChange", function (event) {
      get_ranges(document.getElementById("beg_county").value);
    });
  document
    .getElementById("route")
    .addEventListener("calciteComboboxChange", function (event) {
      listEndInfo(event);
    });
  document
    .getElementById("plot_PM")
    .addEventListener("click", function (event) {
      plot_PM(event);
    });

     document
    .getElementById("RadioPMtoXY")
    .addEventListener("calciteRadioButtonGroupChange", function (event) {
      actionPMtoXY(event);
    });

    
      function plot_PM() {
    //console.log(document.getElementById("beg_county").value);
    //validate entries
    PM_Seg_graphics = [];
    PM_Pts_graphics = [];
    PM_Pts_graphics.length = 0;
    PM_Seg_graphics.length = 0;

    if (
      document.getElementById("beg_county").value === "" ||
      document.getElementById("route").value === "" ||
      document.getElementById("Begin_PM").value === ""
    ) {
      document.getElementById("Message_html").innerHTML =
        "Please specify all parameters and enter the correct format";
      notice.open = true;
      return;
    } else {
      if (document.getElementById("spot_radioPM").checked) {
        run_the_PMtoXY();
      } else if (document.getElementById("segment_radioPM").checked) {
        //  console.log( document.getElementById("end_county").value +"   end_pm: " + document.getElementById("End_PM").value);
        if (
          document.getElementById("end_county").value === "" ||
          document.getElementById("End_PM").value === ""
        ) {
          document.getElementById("Message_html").innerHTML =
            "Please specify all parameters and enter the correct format";
          notice.open = true;
          return;
        } else if (
          document.getElementById("end_county").value ===
            document.getElementById("beg_county").value &&
          document.getElementById("Begin_PM").value ===
            document.getElementById("End_PM").value
        ) {
          document.getElementById("Message_html").innerHTML =
            "Begining and Ending Location are the same. Please select the Spot option";
          notice.open = true;
          return;
        } else {
          run_the_PMtoXY();
        }
      }
    }
  }

     //click on county combobox
  function listRoutes(evt) {
    //clear_form_input("clear_allbybegcounty");
    document.getElementById("ranges_display").style.display = "none";
    document.getElementById("ranges").innerHTML = "";
    document.getElementById("end_ranges").innerHTML = "";
    document.getElementById("route").innerText = null;
    document.getElementById("end_county").innerText = null;
    document.getElementById("end_PMSuffix").value = null;
    document.getElementById("end_PMPrefix").value = null;

    var routelist = [];
    while (routeselection.hasChildNodes()) {
      routeselection.removeChild(routeselection.firstChild);
    }
    routeselection.length = 0;
    //console.log(thedata);

    // console.log(document.getElementById("beg_county").value);
    var _County_selectedItem = document.getElementById("beg_county").value;
    if (_County_selectedItem.length === 2) {
      _County_selectedItem = _County_selectedItem + ".";
    }

    let getroutes =
      url_prefix + "/0/query?f=json&Where=County=";
    let params = "'" + _County_selectedItem + "'";
    params +=
      "&returnGeometry=false&returnDistinctValues=true&outFields=RouteNum";
    getroutes = getroutes + params;
    // console.log(getroutes);

    var options = {
      query: {
        f: "json",
      },
      responseType: "json",
    };

    esriRequest(getroutes, options).then((response) => {
      routelist = response.data.features;
      for (let items of routelist) {
        const comboItem = document.createElement("calcite-combobox-item");
        comboItem.setAttribute("value", items.attributes.RouteNum);
        comboItem.setAttribute("text-label", items.attributes.RouteNum);
        // console.log(comboItem.attributes[0].value)
        routeselection.appendChild(comboItem);
      }
    });
  }

  //click on Route combobox
  function listEndInfo() {
    let co = document.getElementById("beg_county").value;
    get_ranges(co);

    //Load End county combobox if segment radio is checked
    get_endcounties_inroute();
  }

  function get_ranges(county, route = "") {
    let co = county;
    let PMStartarray = [];
    let PMEndarray = [];
    if (county === "") {
      return;
    }
    var rte = document.getElementById("route").value;
    if (rte === "") {
      rte = route;
    }
    var rangelist = [];
    var params = "";
    thedata = [];
    var the_string = "";

    let getranges =
      url_prefix + "/4/query?f=json&Where=RouteNum=";
    params = rte + " AND County = '" + co;
    params += "'&outFields=BeginPM, EndPM,PMPrefix,PMSuffix";
    getranges = getranges + encodeURI(params);
    //console.log(getranges);

    var options = {
      query: {
        f: "json",
      },
      responseType: "json",
    };

    esriRequest(getranges, options)
      .then((response) => {
        rangelist = response.data.features;
        //   console.log(rangelist);
        //  console.log(document.getElementById("align").value);
        if (document.getElementById("align").value === "") {
          document.getElementById("align").value = "R";
        }
        //    console.log(document.getElementById("align").value);
        // the_string = "<span style='color:red'><b><u>PM Ranges for: </u></b><br>";
        the_string +=
          "<span style='color:red'>County: " + co + " Rte: " + rte + "<br><br>";
        let thecounter = 0;
        for (let items of rangelist) {
          PMStartarray.push(items.attributes.BeginPM);
          PMEndarray.push(items.attributes.EndPM);

          if (thecounter === rangelist.length - 1) {
            if (document.getElementById("end_county").value.length > 0) {
              //  BegPMatStart = Math.min(...PMStartarray);
              //   BegPMatEnd = Math.max(...PMEndarray)
              EndPMatStart = Math.min(...PMStartarray);
              EndPMatEnd = Math.max(...PMEndarray);
            } else {
              BegPMatStart = Math.min(...PMStartarray);
              BegPMatEnd = Math.max(...PMEndarray);
            }

            //  console.log(BegPMatStart);
            //  console.log(BegPMatEnd);
            //  console.log(EndPMatStart);
            //  console.log(EndPMatEnd);
          }

          // if (thecounter === 0) {
          //   EndPMatStart = items.attributes.BeginPM;
          // }
          // if (thecounter === rangelist.length - 1) {
          //   EndPMatEnd = items.attributes.EndPM;
          // }

          const comboItem = document.createElement("calcite-combobox-item");
          if (items.attributes.PMPrefix == null) {
            items.attributes.PMPrefix = "";
          }
          if (items.attributes.PMSuffix == null) {
            items.attributes.PMSuffix = "";
          }

          // if (
          //   document.getElementById("align").value ===
          //     items.attributes.PMSuffix ||
          //   items.attributes.PMSuffix === ""
          // ) {
          the_string +=
            items.attributes.PMPrefix +
            items.attributes.BeginPM +
            items.attributes.PMSuffix +
            " to: " +
            " " +
            items.attributes.PMPrefix +
            items.attributes.EndPM +
            items.attributes.PMSuffix +
            "<br>";

          thecounter++;
          //}
          // comboItem.setAttribute('value', items.attributes.RouteNum);
          // comboItem.setAttribute('text-label', items.attributes.RouteNum);
          // routeselection.appendChild(comboItem);
        }
        the_string += "</span>";
        //   console.log(the_string);
        // console.log(BegPMatStart + " " + BegPMatEnd);
        document.getElementById("ranges_display").style.display = "block";
        //console.log(document.getElementById("end_county").value.length);
        if (document.getElementById("end_county").value.length === 0) {
          //no end county selected
          document.getElementById("end_ranges_card").style.display = "none";
          document.getElementById("ranges").innerHTML = the_string;
        } else {
          document.getElementById("end_ranges_card").style.display = "";
          document.getElementById("end_ranges").innerHTML = the_string;
        }
      })
      .catch((err) => {
        console.error("Error encountered", err);
      });
  }

  function get_endcounties_inroute() {
    Endcountyselection = document.getElementById("end_county");
    Endcountyselection.length = 0;
    thedata = [];
    while (Endcountyselection.hasChildNodes()) {
      Endcountyselection.removeChild(Endcountyselection.firstChild);
    }

    if (document.getElementById("segment_radioPM").checked) {
      let rte = document.getElementById("route").value;
      let getEndCounties =
        url_prefix + "/4/query?f=json&Where=RouteNum=";
      let params = rte;
      params += "&returnDistinctValues=true&outFields=County";
      getEndCounties = getEndCounties + params;
      //console.log(getEndCounties);

      var options = {
        query: {
          f: "json",
        },
        responseType: "json",
      };

      esriRequest(getEndCounties, options)
        .then((response) => {
          thedata = response.data;
          //  console.log(thedata);
          let countylist = [];

          //  console.log(thedata.features[0].attributes.County);
          for (let i = 0; i < thedata.features.length; i++) {
            countylist.push({
              label: thedata.features[i].attributes.County,
              value: thedata.features[i].attributes.County,
            });
          }
          // countylist = countylist.slice(0, -1);
          let temp = [];
          temp = countylist;
          temp.sort(function (a, b) {
            if (a.label < b.label) return -1;
            if (a.label > b.label) return 1;
            return 0;
          });
          countylist = temp;
          // console.log(countylist);

          for (let items of countylist) {
            const comboItem = document.createElement("calcite-combobox-item");
            comboItem.setAttribute("value", items.value);
            comboItem.setAttribute("text-label", items.label);
            Endcountyselection.appendChild(comboItem);
          }
        })
        .catch((err) => {
          console.error("Error encountered", err);
        });
    }
  }

  function get_routeID(county, route, rte_s, pm_pre, pm_suf, align) {
    if (county.length === 2) {
      county = county + ".";
    }
    if (route.length === 1) {
      route = "00" + route;
    } else if (route.length === 2) {
      route = "0" + route;
    }
    if (rte_s === "") {
      rte_s = ".";
    }
    if (pm_pre === "") {
      pm_pre = ".";
    }
    if (pm_suf === "") {
      pm_suf = ".";
    }
    if (align === "") {
      align = "R";
    }

    routeID = county + route + rte_s + pm_pre + pm_suf + align;

    return routeID;
  }

  function run_the_PMtoXY() {
    var thecounty = document.getElementById("beg_county").value;
    var theroute = document.getElementById("route").value;
    var theroute_suff = document.getElementById("route_suffix").value;
    var beg_PMPrefix = document.getElementById("beg_PMPrefix").value;
    var beg_PMSuffix = document.getElementById("beg_PMSuffix").value;
    var align = document.getElementById("align").value;
    thebeg_routeid = get_routeID(
      thecounty,
      theroute,
      theroute_suff,
      beg_PMPrefix,
      beg_PMSuffix,
      align
    );
    thebeg_original_routeid = thebeg_routeid;

    if (document.getElementById("segment_radioPM").checked) {
      var theendcounty = document.getElementById("end_county").value;
      var end_PMPrefix = document.getElementById("end_PMPrefix").value;
      var end_PMSuffix = document.getElementById("end_PMSuffix").value;
      theend_routeid = get_routeID(
        theendcounty,
        theroute,
        theroute_suff,
        end_PMPrefix,
        end_PMSuffix,
        align
      );
      theend_original_routeid = theend_routeid;

      plot_PMsegment(theend_routeid);
    } else {
      plot_PMspot(thebeg_routeid);
    }
  }

  /////////// Plot PM Spot ////////////////////////////////

  function getvalidPM() {
    stop_process = false;
    Begin_PM = document.getElementById("Begin_PM").value;
    End_PM = document.getElementById("End_PM").value;
    BegPM_original = Begin_PM;
    EndPM_original = End_PM;
    if (BegPMatStart - 1 > Begin_PM || BegPMatEnd + 1 < Begin_PM) {
      document.getElementById("Message_html").innerHTML =
        "PM info are invalid. Check the PM range listing.";
      notice.open = true;
      stop_process = true;
      return;
    } else if (BegPMatStart > Begin_PM && Begin_PM > BegPMatStart - 1) {
      Begin_PM = BegPMatStart;
      BegPM_changed = true;
    } else if (BegPMatEnd + 1 > Begin_PM && Begin_PM > BegPMatEnd) {
      Begin_PM = BegPMatEnd;
      BegPM_changed = true;
    }
    if (End_PM) {
      if (EndPMatStart - 1 > End_PM || EndPMatEnd + 1 < End_PM) {
        document.getElementById("Message_html").innerHTML =
          "PM info are invalid. Check the PM range listing.";
        notice.open = true;
        stop_process = true;
        return;
      } else if (EndPMatStart > End_PM && End_PM > BegPMatStart - 1) {
        End_PM = EndPMatStart;
        EndPM_changed = true;
      } else if (EndPMatEnd + 1 > End_PM && End_PM > EndPMatEnd) {
        End_PM = EndPMatEnd;
        EndPM_changed = true;
      }
    }
  }

  function plot_PMspot(thePMPointrouteid) {
    console.log(thePMPointrouteid);
    Begin_PM = document.getElementById("Begin_PM").value;
    if (!document.getElementById("End_PM").value) {
      console.log("Null");
    }
    let themessage = "";
    var options = {
      query: {
        f: "json",
      },
      responseType: "json",
    };
    arcgisMap.view.map.layers.forEach((layer) => {
      console.log(layer.title);
      if (layer.title === "PM Pts") {
        arcgisMap.map.remove(layer);
      }
    });

    PM_Pts_layer = new FeatureLayer({
      title: "PM Pts",
      renderer: {
        type: "simple",
        symbol: pointSymbol,
      },
      fields: [
        {
          name: "ObjectID",
          alias: "ObjectID",
          type: "oid",
        },
        {
          name: "RouteID",
          alias: "RouteID",
          type: "string",
        },
        {
          name: "Begin_PM",
          alias: "Begin PM",
          type: "string",
        },
        {
          name: "Begin_Coords",
          alias: "Begin Coords",
          type: "string",
        },
      ],
      objectIdField: "ObjectID",
      geometryType: "point",
      id: "PM Point",
    });
    console.log(thePMPointrouteid);
    notice.open = false;

    // thePMPointrouteid = "TUO108.R.R"

    // if (BegPMatStart - 1 > Begin_PM || BegPMatEnd + 1 < Begin_PM) {
    //   document.getElementById("Message_html").innerHTML =
    //     "PM is invalid. Check for the PM range.";
    //   notice.open = true;
    //   return;
    // } else if (BegPMatStart >= Begin_PM && Begin_PM >= BegPMatStart - 1) {
    //   PM_original = Begin_PM;
    //   Begin_PM = BegPMatStart;
    //   PM_changed = true;
    // } else if (BegPMatEnd + 1 >= Begin_PM && Begin_PM >= BegPMatEnd) {
    //   PM_original = Begin_PM;
    //   Begin_PM = BegPMatEnd;
    //   PM_changed = true;
    // }

    getvalidPM();
    if (stop_process) {
      return;
    }

    const location = [
      {
        routeId: thePMPointrouteid,
        measure: Begin_PM,
      },
    ];

    //console.log(location);
    let getodometerfromPMPoint =
      url_prefix +
      "/exts/LRServer/networkLayers/0/translate?f=json";
    getodometerfromPMPoint +=
      "&locations=" + encodeURIComponent(JSON.stringify(location));
    getodometerfromPMPoint +=
      "&targetNetworkLayerIds=" + encodeURIComponent(JSON.stringify([1]));
    console.log(getodometerfromPMPoint);

    esriRequest(getodometerfromPMPoint, options)
      .then((response) => {
        let thedata = response.data;
        console.log(thedata);

        if (thedata.locations[0].translatedLocations.length === 0) {
          original_routeid = thePMPointrouteid;
          fix_error(thePMPointrouteid, Begin_PM);
          // document.getElementById("Message_html").innerHTML =
          //   "PM is invalid. Check for the prefix/suffix and/or PM range";
          // notice.open = true;
          // return;
        } else {
          if (BegPM_changed) {
            themessage =
              "The selected PM is invalid. It was corrected with the correct PM";
            themessage += "<br>Original PM: " + BegPM_original;
            themessage += "<br>Correct PM: " + Begin_PM;
            document.getElementById("Message_html").innerHTML = themessage;
            notice.open = true;
            BegPM_changed = false;
          }
          getPMfromodometer(thedata);
        }
        //console.log(thedata)
      })
      .catch((err) => {
        console.error("Error encountered", err);
      });

    //  console.log(theresults)
  }

  function fix_error(routeID, PM) {
    stop_prefix_check = false;
    invalid_routeID = "";
    invalid_routeID = routeID;
    PM_fixed = false;
    // End_PM = document.getElementById("End_PM").value;

    var location_pm = [];
    location_pm.length = 0;

    //current PM Prefix

    console.log(routeID.charAt(7));
    // if (between(PM, PM-, 0.009)) {
    //   // something
    // }
    let align = document.getElementById("align").value;
    if (align === "") {
      align = "R";
    }
    //for (let i = 0; i < alignments.length; i++) {
    for (let j = 0; j < suffixes.length; j++) {
      for (let n = 0; n < prefixesTop.length; n++) {
        routeID = routeID.substring(0, 9) + align;
        routeID =
          routeID.substring(0, 7) + prefixesTop[n] + routeID.substring(8);
        routeID = routeID.substring(0, 8) + suffixes[j] + routeID.substring(9);
        // console.log(routeID);

        //  console.log(routeID)
        // thePMPointrouteid = "TUO108.R.R"
        const location = [
          {
            routeId: routeID,
            measure: PM,
          },
        ];
        location_pm.push(location);
      }
    }
    // }
    console.log(location_pm);

    correct_prefix_suffix(location_pm);
  }

  function correct_prefix_suffix(location_pm) {
    var handleAllPromises_locations = null;
    var promiseArr = [];
    promiseArr.length = 0;
    correct_routeID = "";

    var options = {
      query: {
        f: "json",
      },
      responseType: "json",
    };

    for (let k = 0; k < location_pm.length; k++) {
      let getodometerfromPMPoint =
        url_prefix +
        "/exts/LRServer/networkLayers/0/translate?f=json";
      getodometerfromPMPoint +=
        "&locations=" + encodeURIComponent(JSON.stringify(location_pm[k]));
      getodometerfromPMPoint +=
        "&targetNetworkLayerIds=" + encodeURIComponent(JSON.stringify([1]));
      //console.log(getodometerfromPMPoint);

      promiseArr.push(esriRequest(getodometerfromPMPoint, options));
    }

    handleAllPromises_locations = Promise.all(promiseArr);
    handleAllPromises_locations.then(function (values) {
      //   console.log(values);

      let themessage = "";
      let valid_data = [];
      valid_data.length = 0;
      for (let v = 0; v < values.length; v++) {
        thedata = values[v].data;
        if (thedata.locations[0].translatedLocations.length > 0) {
          correct_routeID = thedata.locations[0].routeId;
          PM_fixed = true;
          counter_Pts = 0;
          if (!End_PM) {
            if (!PM_fixed) {
              document.getElementById("Message_html").innerHTML =
                "PM is invalid. Check for the prefix/suffix and/or PM range.";
              notice.open = true;
              return;
            } else {
              themessage =
                "The selected PM is invalid. It was corrected with the correct PM prefix/suffix.";
              if (BegPM_changed) {
                themessage += "<br>Original PM: " + BegPM_original;
                themessage += "<br>Correct PM: " + thedata.locations[0].measure;
                BegPM_changed = false;
              }
              themessage += "<br>Invalid RouteId: " + original_routeid;
              themessage += "<br>Correct RouteId(s): " + correct_routeID;
              document.getElementById("Message_html").innerHTML = themessage;
              notice.open = true;
              correct_routeID = "";
            }
            getPMfromodometer(thedata);
            return;
          }
          break;
        }
        if (v === values.length - 1 && !correct_routeID) {
          // check for bottom prefixes
          if (stop_prefix_check) {
            document.getElementById("Message_html").innerHTML =
              "PM is invalid. Check for the prefix/suffix and/or PM range.";
            notice.open = true;
            return;
          }
          stop_prefix_check = true;
          console.log("nada");
          routeID = invalid_routeID;
          var handleAllPromises_locations = null;
          let align = document.getElementById("align").value;
          var location_pm = [];
          location_pm.length = 0;
          var promiseArr = [];
          promiseArr.length = 0;
          for (let j = 0; j < suffixes.length; j++) {
            for (let n = 0; n < prefixesBottom.length; n++) {
              routeID = routeID.substring(0, 9) + align;
              routeID =
                routeID.substring(0, 7) +
                prefixesBottom[n] +
                routeID.substring(8);
              routeID =
                routeID.substring(0, 8) + suffixes[j] + routeID.substring(9);
              const location = [
                {
                  routeId: routeID,
                  measure: thedata.locations[0].measure,
                },
              ];
              location_pm.push(location);
            }
          }
          correct_prefix_suffix(location_pm);
        }
      }
    });
  }

  function getPMfromodometer(thedata) {
    //var Begin_PM = document.getElementById("Begin_PM").value;
    Begin_PM = thedata.locations[0].measure;
    //console.log(thedata);
    var thePMPointrouteid = thedata.locations[0].routeId;
    var promiseArr_Odor = [];
    promiseArr_Odor.length = 0;

    var handleAllPromises_Odor = null;
    const location = [
      {
        routeId: thePMPointrouteid,
        measure: Begin_PM,
      },
    ];

    let getXYfromPMPoint =
      url_prefix +
      "/exts/LRServer/networkLayers/0/measureToGeometry?f=json";
    getXYfromPMPoint +=
      "&locations=" + encodeURIComponent(JSON.stringify(location));
    getXYfromPMPoint += "&outSR=102100";

    var options = {
      query: {
        f: "json",
      },
      responseType: "json",
    };

    promiseArr_Odor.push(esriRequest(getXYfromPMPoint, options));
    handleAllPromises_Odor = Promise.all(promiseArr_Odor);
    handleAllPromises_Odor
      .then(function (response) {
        let thedata = response[0].data;
        if (
          thedata.locations[0].status.includes("CannotFind") &&
          thedata.locations.length === 1
        ) {
          document.getElementById("Message_html").innerHTML =
            "No Location can be found!";
          notice.open = true;
        } else {
          let startX = thedata.locations[0].geometry.x;
          let startY = thedata.locations[0].geometry.y;
          var coords = webMercatorUtils.xyToLngLat(startX, startY);
          //console.log(coords);
          var content = "";
        }

        var Coordinates =
          "Lat: " + coords[1].toFixed(7) + ", Long:" + coords[0].toFixed(7);

        var thePoint = new Point(
          coords,
          new SpatialReference({
            wkid: 4326,
          })
        );

        var pointAtt = {
          ObjectID: counter_Pts,
          RouteID: thePMPointrouteid,
          Begin_PM: Begin_PM,
          Begin_Coords: Coordinates,
        };

        let thetitle = "PM Point" + counter_Pts;
        thegraphic_pm = new Graphic({
          geometry: thePoint,
          symbol: pointSymbol,
          attributes: pointAtt,
          popupTemplate: {
            title: thetitle,
            content: content,
          },
        });

        counter_Pts += 1;
        PM_Pts_graphics.push(thegraphic_pm);
        console.log(PM_Pts_graphics);
      })
      .then(function () {
        setTimeout(() => {
          console.log(PM_Pts_layer.source);

          PM_Pts_layer.source = PM_Pts_graphics;

          arcgisMap.map.add(PM_Pts_layer);
          notifyusers();

          PM_Pts_layer.when(() => {
            return PM_Pts_layer.queryExtent();
          }).then((response) => {
            arcgisMap.view.goTo({
              target: PM_Pts_graphics,
            });
            arcgisMap.view.zoom = 20;
            if (document.getElementById("buffer_checked?").checked) {
              reset_buffer_panel();
              document.getElementById("BufferLayers").style.display = "block";
              create_buffer_graphic(PM_Pts_graphics[0]);
            }
          });
        }, 100);
      });
  }

  ////////////////// End PM Spot ////////////////////////////////
  ///////////////PM Segment /////////////////////////////////

  function plot_PMsegment(theend_routeid) {
    if (document.getElementById("postmile-panel").style.display === "block") {
      Begin_PM = document.getElementById("Begin_PM").value;
      End_PM = document.getElementById("End_PM").value;
    }

    beg_routeId = true;
    end_routeId = true;
    let rerun = false;

    // if (document.getElementById("segment_radioXY").checked) {
    //   var datafromXYsegment = theend_routeid;

    //   thebeg_routeid = datafromXYsegment[0].routeId;
    //   Begin_PM = datafromXYsegment[0].fromMeasure;
    //   theend_routeid = datafromXYsegment[0].toRouteId;
    //   End_PM = datafromXYsegment[0].toMeasure;
    // }

    var options = {
      query: {
        f: "json",
      },
      responseType: "json",
    };

    arcgisMap.view.map.layers.forEach((layer) => {
      // console.log(layer.title);
      if (layer.title === "PM Segs") {
        arcgisMap.map.remove(layer);
      }
    });

    PM_Seg_layer = new FeatureLayer({
      title: "PM Segs",
    //  spatialReference: { wkid: 102100 },
      renderer: {
        type: "simple",
        symbol: polylineSymbol,
      },
      fields: [
        {
          name: "ObjectID",
          alias: "ObjectID",
          type: "oid",
        },
        {
          name: "Begin_RouteID",
          alias: "Begin RouteID",
          type: "string",
        },
        {
          name: "Begin_PM",
          alias: "Begin PM",
          type: "string",
        },
        {
          name: "Begin_Coords",
          alias: "Begin Coords",
          type: "string",
        },
        {
          name: "Ending_RouteID",
          alias: "Ending RouteID",
          type: "string",
        },
        {
          name: "Ending_PM",
          alias: "End PM",
          type: "string",
        },
        {
          name: "Ending_Coords",
          alias: "Ending Coords",
          type: "string",
        },
      ],
      objectIdField: "ObjectID",
      geometryType: "polyline",
      id: "PM Segment",
    });
    if (postmile_panel.style.display === "block") {
      getvalidPM();
    }
    if (stop_process) {
      return;
    }

    const location = [
      {
        routeId: thebeg_routeid,
        measure: Begin_PM,
      },
      {
        routeId: theend_routeid,
        measure: End_PM,
      },
    ];

    /// cheat
    // const location = [{
    //     "routeId": "SF.001...L",
    //     "measure": 2.021
    //   },
    //   {
    //     "routeId": "SF.001...L",
    //     "measure": 1.853
    //   }
    // ]

    // console.log(location);

    let getodometertranslation =
      url_prefix +
      "/exts/LRServer/networkLayers/0/translate?f=json";
    getodometertranslation +=
      "&locations=" + encodeURIComponent(JSON.stringify(location));
    getodometertranslation +=
      "&targetNetworkLayerIds=" + encodeURIComponent(JSON.stringify([1]));
    //console.log(getodometertranslation);

    esriRequest(getodometertranslation, options).then((response) => {
      let thedata = response.data;

      // console.log(thedata);

      if (thedata.locations[0].translatedLocations.length === 0) {
        beg_routeId = false;
        rerun = true;
      } else {
        beg_routeId = true;
      }
      if (thedata.locations[1].translatedLocations.length === 0) {
        end_routeId = false;
        rerun = true;
      } else {
        end_routeId = true;
      }

      if (!beg_routeId || !end_routeId) {
        check_prefix_suffix();
      }

      if (
        thedata.locations[0].translatedLocations.length > 0 &&
        thedata.locations[1].translatedLocations.length > 0
      ) {
        plot_PM_Seg(thedata);
      }
    });
  }

  function check_prefix_suffix() {
    console.log(beg_routeId + " " + end_routeId);

    //if the beg routeid or both beg and end routeid have error
    if (!beg_routeId) {
      original_routeid = thebeg_routeid;
      fix_error(thebeg_routeid, Begin_PM);
      let id = setInterval(check_correct_routeId, 10);
      function check_correct_routeId() {
        if (correct_routeID) {
          clearInterval(id);
          console.log(correct_routeID);
          beg_routeId = true;
          thebeg_routeid = correct_routeID;
          correct_routeID = "";
          if (!end_routeId) {
            original_routeid = theend_routeid;
            fix_error(theend_routeid, End_PM);
            let id2 = setInterval(check_correct_routeId2, 10);
            function check_correct_routeId2() {
              if (correct_routeID) {
                clearInterval(id2);
                console.log(correct_routeID);
                end_routeId = true;
                theend_routeid = correct_routeID;
                correct_routeID = "";
                rerun_odor();
              }
            }
          } else {
            rerun_odor();
          }
        }
      }
      //only the end routeid has error
    } else if (!end_routeId) {
      original_routeid = theend_routeid;
      fix_error(theend_routeid, End_PM);
      let id2 = setInterval(check_correct_routeId2, 10);
      function check_correct_routeId2() {
        if (correct_routeID) {
          clearInterval(id2);
          console.log(correct_routeID);
          end_routeId = true;
          theend_routeid = correct_routeID;
          correct_routeID = "";
          rerun_odor();
        }
      }
    }
  }

  function rerun_odor() {
    const thelocation = [
      {
        routeId: thebeg_routeid,
        measure: Begin_PM,
      },
      {
        routeId: theend_routeid,
        measure: End_PM,
      },
    ];

    var options = {
      query: {
        f: "json",
      },
      responseType: "json",
    };
    let getodometertranslation =
      url_prefix +
      " /exts/LRServer/networkLayers/0/translate?f=json";
    getodometertranslation +=
      "&locations=" + encodeURIComponent(JSON.stringify(thelocation));
    getodometertranslation +=
      "&targetNetworkLayerIds=" + encodeURIComponent(JSON.stringify([1]));
    console.log(getodometertranslation);

    esriRequest(getodometertranslation, options)
      .then((theresponse) => {
        console.log(theresponse);
        thedata = theresponse.data;
      })
      .then(function () {
        plot_PM_Seg(thedata);
        return;
      });
  }

  function plot_PM_Seg(thedata) {
    let themessage = "";
    var measure1, measure2, transRouteid;
    var theroute = document.getElementById("route").value;
    var promiseArr_PMSeg = [];
    promiseArr_PMSeg.length = 0;

    var handleAllPromises_PMSeg = null;
    correct_Beg_RouteID = thedata.locations[0].routeId;
    correct_End_RouteID = thedata.locations[1].routeId;

    // if (BegPM_changed || EndPM_changed) {
    themessage = "";
    if (BegPM_changed) {
      themessage += "<br>Original Begin PM: " + BegPM_original;
      themessage += "<br>Correct BeginPM: " + Begin_PM;
      BegPM_changed = false;
    }
    if (EndPM_changed) {
      themessage += "<br>Original End PM: " + EndPM_original;
      themessage += "<br>Correct End PM: " + End_PM;
      EndPM_changed = false;
    }
    if (thebeg_original_routeid != thedata.locations[0].routeId) {
      themessage +=
        "<br>Original Beginning RouteID: " + thebeg_original_routeid;
      themessage +=
        "<br>Correct Beginning RouteID: " + thedata.locations[0].routeId;
    }
    if (theend_original_routeid != thedata.locations[1].routeId) {
      themessage += "<br>Original Ending RouteID: " + theend_original_routeid;
      themessage +=
        "<br>Correct Ending RouteID: " + thedata.locations[1].routeId;
    }
    if (themessage != "") {
      let start =
        "The selected PM(s) is/are invalid. It was corrected with the correct PM";
      themessage = start + themessage;
      document.getElementById("Message_html").innerHTML = themessage;
      notice.open = true;
    }

    // }

    var options = {
      query: {
        f: "json",
      },
      responseType: "json",
    };

    console.log();
    for (let k = 0; k < thedata.locations[0].translatedLocations.length; k++) {
      if (
        thedata.locations[0].translatedLocations[k].routeId.includes(theroute)
      ) {
        measure1 = thedata.locations[0].translatedLocations[k].measure;
        transRouteid = thedata.locations[0].translatedLocations[k].routeId;
        break;
      }
    }

    for (let m = 0; m < thedata.locations[1].translatedLocations.length; m++) {
      if (
        thedata.locations[1].translatedLocations[m].routeId.includes(theroute)
      ) {
        measure2 = thedata.locations[1].translatedLocations[m].measure;
        transRouteid = thedata.locations[1].translatedLocations[m].routeId;
        break;
      }
    }
    if (measure1 && measure2) {
      const location = [
        {
          routeId: transRouteid,
          fromMeasure: measure1,
          toMeasure: measure2,
        },
      ];

      let getXYfromOdometer =
        url_prefix +
        "/exts/LRServer/networkLayers/1/measureToGeometry?f=json";
      getXYfromOdometer +=
        "&locations=" + encodeURIComponent(JSON.stringify(location));
      getXYfromOdometer += "&outSR=3857";

      promiseArr_PMSeg.push(esriRequest(getXYfromOdometer, options));
      handleAllPromises_PMSeg = Promise.all(promiseArr_PMSeg);
      handleAllPromises_PMSeg
        .then(function (response) {
          let thedata = response[0].data;

          if (
            thedata.locations[0].status.includes("CannotFind") &&
            thedata.locations.length === 1
          ) {
            document.getElementById("Message_html").innerHTML =
              "<span style='color:red'><b>No Location can be found!</b></span>";
            notice.open = true;
          } else if (thedata.locations[0].status.includes("Different")) {
            document.getElementById("search_results").innerHTML =
              "<span style='color:red'><b>Beginning and Ending routeid have diffent line ids.</b></span>";

            document.getElementById("Message_html").innerHTML =
              "<span style='color:red'><b>Beginning and Ending routeid have different line ids.</b></span>";
            notice.open = true;
            return;
          } else {
            // var lineXX = new Polyline(
            //   new SpatialReference({
            //     wkid: 4326,
            //   })
            // );
            const sr = arcgisMap.view.spatialReference; // usually wkid 3857

          const lineXX = new Polyline({ spatialReference: sr });

            for (
              let j = 0;
              j < thedata.locations[0].geometry.paths.length;
              j++
            ) {
              var thepaths = [];
              thepaths = thedata.locations[0].geometry.paths[j];
              // console.log(thepaths.length);
              // console.log("Array: " + j);
              var promises = [];
              var thegraphic = null;

              for (let i = 0; i < thepaths.length; i++) {
                //  console.log(thepaths[i])
                //store only XY
                thepaths[i].length = 2;
                //  console.log(thepaths[i])
                promises.push(thepaths[i]);

                if (i === thepaths.length - 1) {
                  lineXX.addPath(promises);
                }
              }

              if (j === 0) {
                let startX = thepaths[j][0];
                let startY = thepaths[j][1];
                var thecoords = webMercatorUtils.xyToLngLat(startX, startY);
              }
              if (j === thedata.locations[0].geometry.paths.length - 1) {
                let endX = thepaths[thepaths.length - 1][0];
                let endY = thepaths[thepaths.length - 1][1];
                var theend_coords = webMercatorUtils.xyToLngLat(endX, endY);
              }
            }

            var content = "";

            var beg_coords =
              "Lat: " +
              thecoords[1].toFixed(7) +
              ", Long:" +
              thecoords[0].toFixed(7);
            var end_coords =
              "Lat: " +
              theend_coords[1].toFixed(7) +
              ", Long:" +
              theend_coords[0].toFixed(7);

            if (correct_Beg_RouteID !== null) {
              thebeg_routeid = correct_Beg_RouteID;
            }
            if (correct_End_RouteID !== null) {
              theend_routeid = correct_End_RouteID;
            }

            var LineAtt = {
              ObjectID: counter_Seg,
              Begin_RouteID: thebeg_routeid,
              Begin_PM: Begin_PM,
              Begin_Coords: beg_coords,
              Ending_RouteID: theend_routeid,
              Ending_PM: End_PM,
              Ending_Coords: end_coords,
            };

            let thetitle = "PM Segment" + counter_Seg;
            var thegraphic = new Graphic({
              geometry: lineXX,
              symbol: polylineSymbol,
              attributes: LineAtt,
              popupTemplate: {
                title: thetitle,
                content: content,
              },
            });
            counter_Seg += 1;
            PM_Seg_graphics.push(thegraphic);
          }
        })
        .then(function () {
          //console.log(PM_Seg_layer.source);
          PM_Seg_layer.source = PM_Seg_graphics;
         // const popupTemplate = PM_Seg_layer.createPopupTemplate();
         // PM_Seg_layer.popupTemplate = popupTemplate;

          arcgisMap.map.add(PM_Seg_layer);
          notifyusers();
          PM_Seg_layer.spatialReference = arcgisMap.view.spatialReference
          PM_Seg_layer.when(() => {
            return PM_Seg_layer.queryExtent();
          }).then((response) => {
            arcgisMap.view.goTo(response.extent);
          });

          //console.log(lineXX.extent);
          //view.graphics.add(thegraphic);
          // view.goTo(lineXX.extent).then(function () {
          //   //view.zoom = 10;
          //   view.zoom -= 1;
          // });
          if (document.getElementById("buffer_checked?").checked) {
            reset_buffer_panel();
            document.getElementById("BufferLayers").style.display = "block";
            create_buffer_graphic(PM_Seg_graphics[0]);
          }
        });
    }
  }

    document.getElementById("reset_buffer").addEventListener("click", () => {
    reset_buffer_panel();
  });

  function reset_buffer_panel() {
    var allcombo_buffer = document.getElementsByTagName("calcite-combobox");
    for (let j = 0; j < allcombo_buffer.length; j++) {
      if (allcombo_buffer[j].id.includes("LayerBuffer")) {
        document.getElementById(allcombo_buffer[j].id).innerText = null;
      }
      // if (allcombo_buffer[j].id.includes("buffer_dist")) {
      //   document.getElementById(allcombo_buffer[j].id).value = null;
      // }
    }
    document.getElementById("BufferLayers").style.display = "none";
  }

   function create_buffer_graphic(graphic) {
    //event.stopPropagation();

    console.log(graphic);

    //if (graphic.geometry.type === "point"){
    const sym = {
      type: "simple-fill",
      color: [227, 139, 79, 0.25],
      style: "solid",
      outline: {
        color: [255, 255, 255, 255],
        width: 1,
      },
    };
    // } else {

    // }

   const val = document.getElementById("buffer_dist")?.value ?? "0";
    const dist = Number(val);
    if (!Number.isFinite(dist) || dist <= 0) {
      console.warn("Buffer distance must be a positive number.");
      return;
    }
    const buffer = geometryEngine.geodesicBuffer(
      graphic.geometry,
      dist,
      "miles"
    );
    console.log(buffer);
    let bufferGraphic = new Graphic({ geometry: buffer, symbol: sym });
    // add graphic to map
    if (graphicsLayer_buffer) {
      arcgisMap.map.remove(graphicsLayer_buffer);
    }
    graphicsLayer_buffer = new GraphicsLayer({
      id: "Buffer_graphic",
      title: "Buffer graphic",
      listMode: "hide",
      //   listMode: "hide",
      // });
    });
    graphicsLayer_buffer.add(bufferGraphic);

    arcgisMap.map.add(graphicsLayer_buffer);
  }

   //Buffer Widget
  for (let j = 1; j < 6; j++) {
    let thevar = "LayerBuffer" + j;
    document.getElementById(thevar).addEventListener("click", (evt) => {
      console.log(evt.target.id);
      listLayers(evt.target.id);
      // }
    });
  }
  
/////  Click on "Find features" for buffer under PM Tools
  document.getElementById("Buffer_lyrs").addEventListener("click", (evt) => {
    selected_buffer_lyrs_urls.length = 0;
    selected_buffer_lyrs_urls = [];
    for (let j = 0; j < 5; j++) {
      let id = "LayerBuffer" + (j + 1);
      if (document.getElementById(id).value != "") {
        if (!document.getElementById(id).value.includes("null")) {
          selected_buffer_lyrs_urls.push(document.getElementById(id).value);
        }
      }
    }
    // console.log(selected_buffer_lyrs_urls);
    let duplicates = findDuplicates(selected_buffer_lyrs_urls);

    if (duplicates.length > 0) {
      document.getElementById("Message_html").innerHTML =
        "There are duplicate layers";
      notice.open = true;
      selected_buffer_lyrs_urls = [];
      return;
    }
    resources_in_buffer(selected_buffer_lyrs_urls);
    // console.log(selected_buffer_lyrs_urls);
  });

  document
    .getElementById("clear_query_entries")
    .addEventListener("click", () => reset_query_comboboxes());

  function reset_query_comboboxes() {  
    firstqueryon = true;
    document.getElementById("LayerQuery").innerText = null;
    listLayers("LayerQuery");

    const divElement = document.getElementById("QueryListing");
    divElement.replaceChildren();
  }

    function listLayers(comboName) {
    arcgisMap.view.closePopup();

    clearcombobox(comboName);
    let maplayers = [];
    maplayers.length = 0;
    layerselection = "";
    layerselection = document.getElementById(comboName);

    if (arcgisMap.view.map.layers.length === 0) {
      alert("Load at least one layer to the map");
    } else {
      arcgisMap.view.map.layers.map(function (lyr) {
        //  console.log(lyr.type + "  " + lyr.url + "  " + lyr.layerId)

        if (comboName.includes("LayerBuffer")) {
          if (lyr.type === "feature") {
            if (
              lyr.title.includes("PM Point") ||
              lyr.title.includes("PM Segment") ||
              lyr.title.includes("Buffer for") ||
              lyr.title.includes("PM Pts") ||
              lyr.title.includes("PM Segs")
            ) {
              //skip buffer layers
            } else {
              maplayers.push({
                label: lyr.title,
                value: lyr.url + "/" + lyr.layerId,
              });
            }
          }
        } else {
          if (lyr.type === "feature") {
            if (!lyr.title.includes("Excluded")) {
              maplayers.push({
                label: lyr.title,
                value: lyr.url,
              });
            }
          }
        }
      });

      var comboItem = null;
      // console.log(layerselection);
      for (let item of maplayers) {
        if (item.value) {
          //   console.log(item.value);
          comboItem = document.createElement("calcite-combobox-item");
          comboItem.setAttribute("value", item.value);
          comboItem.setAttribute("text-label", item.label);
          if (layerselection) {
            layerselection.appendChild(comboItem);
          }
        }
      }
    }
  }

  function findDuplicates(arr) {
    const length = arr.length;
    let index = 0,
      newArr = [];
    for (let i = 0; i < length - 1; i++) {
      for (let j = i + 1; j < length; j++) {
        if (arr[i] === arr[j]) {
          newArr[index] = arr[i];
          index++;
        }
      }
    }
    return newArr;
  }

    function resources_in_buffer(layers_urls) {
    console.log(layers_urls);

    const query = {
      geometry: graphicsLayer_buffer.graphics._items[0].geometry,
      outFields: ["*"],
      returnGeometry: true,
    };

    //   theselectedlayer.queryFeatures(query).then((results) => {
    //     if (results.features.length === 0) {
    let index = 0;

    console.log(graphicsLayer_buffer);
    let buffer_layer = [];
    buffer_layer.length = 0;
    let no_buffer_results = 0;
    let buffer_results_found = false
    layers_urls.map(function (url) {
      arcgisMap.view.map.layers.forEach((layer) => {
        let theurl = layer.url + "/" + layer.layerId;
        if (theurl === url) {
          layer
            .queryFeatures(query)
            .then((results) => {
              // if (layer.geometryType.includes("point")){
              //   var buffer_renderer = pointSymbol
              // } else if (layer.geometryType.includes("line")){
              //   var buffer_renderer = polylineSymbol
              // } else if (layer.geometryType.includes("polygon")){
              //   var buffer_renderer = polygonSymbol
              // }
              no_buffer_results += results.features.length;
              /// no need for ture layer if no results found in buffer zone
               if (no_buffer_results > 0) {
                buffer_results_found = true
              buffer_layer[index] = new FeatureLayer({
                source: results.features,
                title: "Buffer for " + layer.title,
                renderer: {
                  type: "simple", // autocasts as new SimpleRenderer()
                  symbol: {
                    type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                    size: 6,
                    color: "black",
                    outline: {
                      // autocasts as new SimpleLineSymbol()
                      width: 0.5,
                      color: "white",
                    },
                  },
                },
                fields: layer.fields,
                objectIdField: "ObjectID",
                geometryType: layer.geometryType,
                id: "Buffer for " + layer.title,
              });
              arcgisMap.map.add(buffer_layer[index]);
              notifyusers();
            }
            })
            .then(function () {
              if (no_buffer_results > 0) {
                
                document.getElementById("Message_html").innerHTML =
                  "The total number of features found: " + no_buffer_results + " within " + layer.title ;
                notice.open = true;
              }
            });
        }
      });
    });
    if (!buffer_results_found){
      document.getElementById("Message_html").innerHTML =
                  "No resources were found within the selected layers" ;
                notice.open = true;
    }
  }



  //////////////////// Google      //////////////////////////////////////
  let isPegmanCursor = false;

  document.getElementById("pegman").addEventListener("click", function () {
    if (!isPegmanCursor) {
      isPegmanCursor = true;
      let number = parseInt(
        document.getElementById("scaleValue").textContent.replace(/,/g, ""),
        10
      );
      if (
        number < 600 &&
        !document.getElementById("scaleValue").textContent.includes("mi")
      ) {
        // Change the cursor style for the whole page
        document.body.classList.add("pegman-cursor");
        document.getElementById("pegmanCaption").innerText = "Pegman is active";
        enableGoogleClick();
      } else {
        document.getElementById("Message_html").innerHTML =
          "You have not reach the map scale of 600 ft yet.";
        notice.open = true;
      }
    } else {
      isPegmanCursor = false;
      if (GoogleClickEvent) {
        GoogleClickEvent.remove();
      }
      document.body.classList.remove("pegman-cursor");
      document.getElementById("pegmanCaption").innerText = "Pegman is inactive";
    }
  });

  function enableGoogleClick() {
    GoogleClickEvent = arcgisFeatureTable.view.on("click", function (evt) {
      arcgisMap.view.popup.visible = false;
      if (notice) {
        notice.open = false;
      }
      var url1 =
        "https://svgcdeaprod.ct.dot.ca.gov/google_tools/index.html?lat=";
      var theX = evt.mapPoint.x.toFixed(5);
      var theY = evt.mapPoint.y.toFixed(5);
      var thelonglat = webMercatorUtils.xyToLngLat(theX, theY, true);
      var thelong = evt.mapPoint.longitude.toFixed(5);
      var thelat = evt.mapPoint.latitude.toFixed(5);
      var comma = "&long=";
      var width = 800;
      var height = 600;
      console.log(screen.availWidth);
      var left = parseInt(screen.availWidth / 2 - width / 2);
      var top = parseInt(screen.availHeight / 2 - height / 2);
      console.log("left: " + left + " top: " + top);
      var windowFeatures =
        "width=" +
        width +
        ",height=" +
        height +
        ",left=" +
        left +
        ",top=" +
        top;
      window.open(
        url1.concat(thelat, comma, thelong),
        "Google Tools",
        windowFeatures
      );
    });
  }


});

