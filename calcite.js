// Developed by Lefteris Koumis - Caltrans
require([
  "esri/WebMap",
  "esri/views/MapView",
  "esri/widgets/Legend",
  "esri/widgets/BasemapGallery",
  "esri/widgets/ElevationProfile",
  "esri/widgets/Measurement",
  "esri/geometry/support/webMercatorUtils",
  "esri/Graphic",
  "esri/symbols/PictureMarkerSymbol",
  "esri/request",
  "esri/layers/support/Field",
  "esri/geometry/Point",
  "esri/layers/Layer",
  "esri/geometry/SpatialReference",
  "esri/geometry/Polyline",
  "esri/widgets/LayerList",
  "esri/layers/FeatureLayer",
  "esri/layers/MapImageLayer",
  "esri/layers/TileLayer",
  "esri/layers/CSVLayer",
  "esri/layers/GeoJSONLayer",
  "esri/layers/KMLLayer",
  "esri/widgets/Feature",
  "esri/renderers/SimpleRenderer",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/geometry/Extent",
  "esri/symbols/support/jsonUtils",
  "esri/geometry/support/jsonUtils",
  "esri/renderers/support/jsonUtils",
  "esri/widgets/Print",
  "esri/core/Collection",
  "esri/widgets/Slider",
  "esri/widgets/FeatureTable",
  "esri/layers/GraphicsLayer",
  "esri/widgets/Sketch",
  "esri/widgets/Sketch/SketchViewModel",
  "esri/geometry/geometryEngineAsync",
  "esri/core/reactiveUtils",
  "esri/geometry/geometryEngine",
  "esri/widgets/Features",
  "esri/config",
  "esri/widgets/ScaleBar",
  "esri/widgets/Home",
  "esri/Basemap",
  "esri/geometry/projection",
  "esri/widgets/Search",
], (
  WebMap,
  MapView,
  Legend,
  BasemapGallery,
  ElevationProfile,
  Measurement,
  webMercatorUtils,
  Graphic,
  PictureMarkerSymbol,
  esriRequest,
  Field,
  Point,
  Layer,
  SpatialReference,
  Polyline,
  LayerList,
  FeatureLayer,
  MapImageLayer,
  TileLayer,
  CSVLayer,
  GeoJSONLayer,
  KMLLayer,
  Feature,
  SimpleRenderer,
  SimpleLineSymbol,
  SimpleMarkerSymbol,
  SimpleFillSymbol,
  Extent,
  symbolJsonUtils,
  geometryJsonUtils,
  rendererJsonUtils,
  Print,
  Collection,
  Slider,
  FeatureTable,
  GraphicsLayer,
  Sketch,
  SketchViewModel,
  geometryEngineAsync,
  reactiveUtils,
  geometryEngine,
  Features,
  esriConfig,
  ScaleBar,
  Home,
  Basemap,
  projection,
  Search
) => {
  // const webmapId = new WebMap({
  //   portalItem: {
  //     id: "51ee1468daab46de874757ac5509ceba",
  //   },
  // });
  //const webmapId = new URLSearchParams(window.location.search).get("webmap") ?? "51ee1468daab46de874757ac5509ceba";
  const symbolclicked = new PictureMarkerSymbol(
    "https://static.arcgis.com/images/Symbols/Animated/EnlargeRotatingRedMarkerSymbol.png",
    20,
    20
  );
  let mapClickEvent,
    thetolerance,
    tol,
    mode,
    thedata,
    countyselection,
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
    layers_config,
    featureLayerView,
    featureTable,
    resultFeatures,
    layerselection,
    layerselection_geom,
    fieldselection,
    operatorselection,
    valueselection,
    //flcount,
    theselectedlayer,
    thefieldname,
    selected_fieldtype,
    selectedoperation,
    field1type,
    field2type,
    fieldvalue,
    thediv,
    thefieldid,
    field3type;
     let distanceButton = document.getElementById("distance");
     let areaButton = document.getElementById("area");
     let clearButton = document.getElementById("clear");



  let recordsPM_Pts = [];
  let webmap = null;
  let PM_fixed = false;
  let table = null;
  let featureLayerViewFilterSelected = false;
  let layer = null;
  let browse = false;
  let tableheight = 50;
  let features = [];
  let firstqueryon = true;
  let filter = false;
  let querycounter = 1;
  let handles = [];
  let theheight = 0;
  let thewidth = 0;
  let prefixes = [".", "R", "L", "T", "M", "N", "D", "G", "H", "C", "S"];
  let prefixesTop = [".", "R", "L", "T", "M"];
  let prefixesBottom = ["N", "D", "G", "H", "C", "S"];
  let suffixes = [".", "R", "L"];
  let alignments = ["R", "L"];
  let charReplaced = "";
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
  let correct_routeID = "";
  let stop_process = false;
  let stop_prefix_check = false;
  let thegraphic_pm = null;
  let initial_extent = null;
  let old_subject = [];
  
 
  let renderer = null;
  let selectedFeatureLayer = null;
  let progressBar = null;

  let navigationButton = null;
  const liveRegionId = "a11y-live-region";
  let notice = document.getElementById("message");
  let notice2 = document.getElementById("message2");
  const sketchLayer = new GraphicsLayer();
  const bufferLayer = new GraphicsLayer();
  const RteByCographics = new GraphicsLayer();
  RteByCographics.listMode = "hide";
  RteByCographics.id = "RteByCOgraphics";
  let featureLayerView_sketch = null;
  let bufferSize = 0;
  let selectedcomboboxquery_geom = null;
  let filterGeometry = null;
  let currentselectedlayer = null;
  //let elevationvisible = false;
  let selected_buffer_lyrs_urls = [];
  let selected_buffer_lyrs_labels = [];
  let counter_Pts = 0;
  let counter_Seg = 0;
  let graphicsLayer_buffer = null;
  let graphicsLayer = new GraphicsLayer();
  graphicsLayer.id = "Sketchgraphics";
  graphicsLayer.listMode = "hide";

  let PMClickedgraphics = new GraphicsLayer();
  PMClickedgraphics.id = "PM nearest clicked point";
  PMClickedgraphics.listMode = "hide";

  let theresults = "";
  let resultsindex = 0;
  let beg_routeId = true;
  let end_routeId = true;

  let oldExtent = null;
  let _prevExtent = false;
  let _preExtent = null;
  let _currentExtent = null;
  let _extentHistory = [];
  let _extentHistoryIndx = 0;
  let _nextExtent = false;
  let PM_Pts_layer = null;
  let PM_Pts_graphics = [];
  let PM_Seg_layer = null;
  let PM_Seg_graphics = [];
  let correct_Beg_RouteID = null;
  let correct_End_RouteID = null;
  let original_routeid = "";
  let invalid_routeID = "";
  let district_json = "";
  let FLoptions = {};
  let total_records = 0;
  let layersCount = 0;
  let layersCount_nowater = 0;
  let total_layer_heading = "";
  let total_layer_heading_nowater = "";
  let sketchGeometry = null;
  let popupWindow;

  // const maskDiv = document.getElementById("maskDiv");
  // const screenshotDiv = document.getElementById("screenshotDiv");
  // const downloadBtn = document.getElementById("downloadBtn");
  // const closeBtn = document.getElementById("closeBtn");
  const map = new WebMap({
    basemap: "streets-navigation-vector",
    ground: "world-elevation",
  });

  const view = new MapView({
    map: map,
    container: "viewDiv",
    padding: {
      left: 49,
    },
    center: [-119.247, 37.741],
    zoom: 6,
    popupEnabled: false,
    constraints: {
      minZoom: 1, // Use this constraint to avoid zooming out too far
    },
  });

  const allowed2DBasemaps = [
    "dark-gray-vector",
    "gray-vector",
    "hybrid",
    "oceans",
    "osm",
    "satellite",
    "streets",
    "streets-navigation-vector",
    "streets-night-vector",
    "streets-relief-vector",
    "streets-vector",
    "terrain",
    "topo",
    "topo-vector",
  ];

  var options = {
    query: {
      f: "json",
    },
    responseType: "json",
  };

  sketchLayer.id = "SketchLayer";
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



  map.add(PMClickedgraphics);
  map.add(RteByCographics);



  let activeView = view;



  initial_extent = view.map.extent;

  const featuresWidget = new Features({
    view: view,
    container: "features-widget",
  });
  const panel = document.getElementById("features-widget");
  const shellPanel = document.getElementById("shell-panel-start");

  reactiveUtils.on(
    () => view,
    "click",
    async (event) => {
      featuresWidget.open({
        location: event.mapPoint,
        fetchFeatures: true,
      });
      //main(view, 400);
      // // Call fetchFeatures and pass in the click event screenPoint
      // featuresWidget.fetchFeatures(event.screenPoint).then((response) => {
      //   // Access the response from fetchFeatures
      //   response.allGraphicsPromise.then((graphics) => {
      //     // If there are no graphics in the click event, then make sure
      //     // the Features widget is not showing.
      //     if (graphics.length === 0) {
      //       featuresWidget.visible = false;
      //     }
      //     // If graphics do exist, set the Features widget features property to the returned
      //     // graphics from fetchFeatures and set the visible property to true.
      //     else {
      //       featuresWidget.features = graphics;
      //       featuresWidget.visible = true;
      //       main(view, 400);
      //       document.getElementById("features-widget").style.display = "block";
      //       shellPanel.collapsed = false;
      //     }
      //   });
      // });

      if (document.querySelector(`[data-action-id=layers]`)) {
        document.querySelector(`[data-panel-id=layers]`).closed = true;
        //document.getElementById("features-widget").style.display = "none";
        shellPanel.collapsed = true;
      }
      if (document.querySelector(`[data-action-id=print]`)) {
        document.querySelector(`[data-panel-id=print]`).closed = true;
      }
      if (document.querySelector(`[data-action-id=basemaps]`)) {
        document.querySelector(`[data-panel-id=basemaps]`).closed = true;
      }

      if (document.querySelector(`[data-action-id=legend]`)) {
        document.querySelector(`[data-panel-id=legend]`).closed = true;
      }

      //interact with table if present
      view.map.layers.map(function (lyr) {
        //console.log(lyr)
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
          shellPanel.collapsed = false;
        }
      });

      await view.hitTest(event).then((response) => {
        response?.results?.some((result) => {
          if (result?.type === "graphic" && table) {
            const graphic = result.graphic;
            const objectId = graphic.getObjectId();
            table.filterGeometry = graphic.geometry;
            table.highlightIds.add(objectId);
            table_panel();
          }
        });
      });

      if (
        document.getElementById("features-widget").style.display === "block"
      ) {
        table_panel();
      }
      // console.log(featuresWidget);
    }
  );

  // //move the search bar and zoom out/in buttons to the left if the shall panel is closed
  // document.getElementById("shell-panel-start").addEventListener("click", (event) => {
  //   if (shellPanel.collapsed){
  //   activeWidget = null;
  //   shellPanel.collapsed = true;
  //   document.getElementById("features-widget").style.display = "none";
  //   main(view, 49);
  //   full_table();
  //   }
  // });

  async function updatePaddingAndWait(view, padding) {
    // Update the padding
    view.padding = padding;

    // Wait until the view finishes updating
    await new Promise((resolve) => {
      const handle = view.watch("updating", (isUpdating) => {
        if (!isUpdating) {
          handle.remove(); // Stop watching once updating is complete
          resolve();
        }
      });
    });

    console.log("MapView refresh complete after padding update!");
  }
  // Table display across the whole screen - side panel close
  function full_table() {
    if (table) {
      var thewidth1 = window.innerWidth - 100;
      document.getElementById("center-row").style.width = thewidth1 + "px";
      document.getElementById("center-row").style.right = 0 + "px";
      document.getElementById("center-row").style.marginLeft = 0 + "px";
    }
  }
  // Table display across with side panel
  function table_panel() {
    if (table) {
      document.getElementById("center-row").style.height = 400 + "px";
      document.getElementById("center-row").style.right = 50 + "px";
      document.getElementById("center-row").style.marginLeft = 160 + "px";
      var thewidth1 = window.innerWidth - 100 - 350;
      document.getElementById("center-row").style.width = thewidth1 + "px";
    }
  }
  //close the shell panel when we close the features widget - adjust table width

  document.getElementById("features-widget").onclick = function (e) {
    console.log(e);
  };

  reactiveUtils.watch(
    () => featuresWidget.visible,
    (visible) => {
      if (!visible) {
        shellPanel.collapsed = true;
        document.getElementById("features-widget").style.display = "none";
        setTimeout(function () {
          // Action to be delayed
          main(view, 49);
        }, 1000);

        full_table();
      }
    }
  );

  view.when(() => {
    shellPanel.collapsed = true;
    featuresWidget.visible = false;
    
    main(view, 49);
    full_table();
    handleAddLayersWidgetClick("HQ");
    let urlSubstring = location.search;
    //console.log(urlSubstring);
   
    //handleAddLayersWidgetClick("");
    view.map.layers.map(function (lyr) {
      //hide unamed layer
      lyr.listMode = "hide";
    });
  });

  view.map.addMany([bufferLayer, sketchLayer]);

  const searchWidget = new Search({
    view: view,
  });

  view.ui.add(searchWidget, {
    position: "top-left",
  });

  // reactiveUtils.whenOnce(() => !view.updating).then(() => {
  //   view.zoom = map_zoom

  // })

  // Add a Graphics Layer to the map to display the map
  // navigation extent search box
  // const graphicsLayer = new GraphicsLayer({
  //   listMode: "hide",
  // });
  // map.add(graphicsLayer);

  var coordsWidget = document.createElement("div");
  coordsWidget.id = "coordsWidget";
  coordsWidget.className = "esri-widget esri-component";
  coordsWidget.style.marginRight = "60px";
  coordsWidget.style.padding = "7px 15px 15px";
  view.ui.add(coordsWidget, "bottom-right");

  //*** Update lat, lon, zoom and scale ***//
  function showCoordinates(pt) {
    var coords =
      "Lat/Lon " +
      pt.latitude.toFixed(3) +
      " " +
      pt.longitude.toFixed(3) +
      " | Scale 1:" +
      Math.round(view.scale * 1) / 1 +
      " | Zoom " +
      view.zoom;
    coordsWidget.innerHTML = coords;
  }

  //*** Add event and show center coordinates after the view is finished moving e.g. zoom, pan ***//
  view.watch(["stationary"], function () {
    showCoordinates(view.center);
  });

  view.watch("extent", function () {
    // console.log("Watch for the current scale: ", view.scale);
  });

  // reactiveUtils.watch(
  //   () => [view.stationary, view.zoom],
  //   ([stationary, zoom]) => {
  //     if(stationary && (zoom != map_zoom) && zoom>1){
  //       if (dark_mode){
  //          view.zoom = map_zoom
  //       }

  //     }
  //   }
  // )

  //*** Add event to show mouse coordinates on click and move ***//
  view.on(["pointer-down", "pointer-move"], function (evt) {
    showCoordinates(view.toMap({ x: evt.x, y: evt.y }));
  });

  view.ui.move("zoom", "top-left");

  view.map.when(() => {
    let activeWidget;

    const handleLeftActionBarClick = ({ target }) => {
      if (target.tagName !== "CALCITE-ACTION") {
        return;
      }
      if (target.text === "Home") {
        view.extent = initial_extent;
        view.goTo({
          center: [-119.475, 37.737],
          zoom: 7,
        });
        return;
      }

      if (target.text.includes("Previous")) {
        zoomPreviousExtent();
        return;
      }

      if (target.text.includes("Next")) {
        zoomNextExtent();
        return;
      }

      // document.getElementById("shell-panel-start").collapsed = true;
      // main(view, 49);
      // full_table();

      if (activeWidget) {
        document.querySelector(
          `[data-action-id=${activeWidget}]`
        ).active = false;
        document.querySelector(`[data-panel-id=${activeWidget}]`).hidden = true;
      }
      // if (document.getElementById("shell-panel-start").collapsed) {
      //   activeWidget = null;
      // }
     /*  document.getElementById("support").open = false;
      document.getElementById("links").open = false; */
      document.getElementById("shell-panel-start").collapsed = true;
      // main(view, 49);
      // full_table();
      // document.getElementById("features-widget").style.display = "none";
      // var support_values = ["layers", "legend", "basemaps_panel", "print"];

      // support_values.forEach((nextWidget) => {
      //   const element = document.querySelector(
      //     `[data-action-id="${nextWidget}"]`
      //   );

      //   if (element) {
      //     element.active = true;
      //     element.hidden = false;
      //     element.closed = false;
      //   }
      // });

      const nextWidget = target.dataset.actionId;

      if (
        nextWidget !== activeWidget 
       //nextWidget != "support" &&nextWidget != "links"
      ) {
        document.querySelector(`[data-action-id=${nextWidget}]`).active = true;
        document.querySelector(`[data-panel-id=${nextWidget}]`).hidden = false;
        document.querySelector(`[data-panel-id=${nextWidget}]`).closed = false;
        activeWidget = nextWidget;
        document.getElementById("shell-panel-start").collapsed = false;
        main(view, 400);
        table_panel();
        document.getElementById("features-widget").style.display = "none";
      } else {
        activeWidget = null;
        document.getElementById("shell-panel-start").collapsed = true;
        main(view, 49);
        full_table();
      }
    };
    document
      .querySelector("#action-bar-left")
      .addEventListener("click", handleLeftActionBarClick);

    const updateDarkMode = () => {
      // Calcite mode
      document.body.classList.toggle("calcite-mode-dark");
      // ArcGIS Maps SDK theme
      const dark = document.querySelector("#arcgis-maps-sdk-theme-dark");
      const light = document.querySelector("#arcgis-maps-sdk-theme-light");
      dark.disabled = !dark.disabled;
      light.disabled = !light.disabled;
      // ArcGIS Maps SDK basemap
      map.basemap = dark.disabled
        ? "streets-navigation-vector"
        : "streets-night-vector";
      // Toggle ArcGIS Maps SDK widgets mode
      // view.zoom = map_zoom
      const widgets = document.getElementsByClassName("esri-ui");
      for (let i = 0; i < widgets.length; i++) {
        widgets.item(i).classList.toggle("calcite-mode-dark");
      }
    };

    document
      .querySelector("calcite-switch")
      .addEventListener("calciteSwitchChange", updateDarkMode);
  });

  var themessage = "";
  themessage +=
    "This is the newer version of the DEA GIS Library. This version is developed using <a href=\"https://developers.arcgis.com/javascript/latest/\" target='_blank'>ArcGIS Maps SDK for JavaScript version 4.x</a> and <a href=\"https://developers.arcgis.com/calcite-design-system/\" target='_blank'>Calcite Design System</a>.<br>";
  themessage +=
    "DEA GIS Library 2.0 is a customized GIS application tailored to the needs of the";
  themessage +=
    " environmental community at Caltrans. The goals of the DEA GIS Library";
  themessage +=
    " is to provide a quick access to environmental spatial information, ";
  themessage +=
    "assist with spatial analysis and to provide crucial information";
  themessage +=
    " regarding resources that are located within the boundaries of a planned project. ";
  themessage +=
    "<br>DEA GIS Library was developed by the HQ Division of the Environmental Analysis, GIS staff.<br>";
  themessage += "If you have questions for<br>";
  themessage +=
    "- data, please contat <a href= 'mailto: anthony.barnes@dot.ca.gov'>Anthony Barnes</a><br>";
  themessage +=
    "- widgets, tools and application functionality, please contact: <a href= 'mailto: lefteris.koumis@dot.ca.gov'>Lefteris Koumis<a>";
  document
    .getElementById("about")
    .addEventListener("calciteMenuItemSelect", () => {
      document.getElementById("Message_html2").innerHTML = themessage;
      notice2.open = true;
    });

  createZoomPrevZoomNextBtns();
  //view.ui.add(["zoomPrevNextBtns"], "top-left");

  //view.ui._removeComponents(["attribution"]);

  let scaleBar = new ScaleBar({
    view: view,
    unit: "imperial",
  });

  //Add widget to the bottom left corner of the view
  view.ui.add(scaleBar, {
    position: "bottom-left",
  });

  // const ccWidget = new CoordinateConversion({
  //   view: view
  // });

  // ccWidget.visibleElements = {
  //   settingsButton: false,
  //   editButton:false,
  //   expandButton: false
  // };

  // view.ui.add(ccWidget, "bottom-left");

  const extentCheckbox = document.getElementById("filter_map_extent");

  extentCheckbox.addEventListener("calciteCheckboxChange", () => {
    if (extentCheckbox.checked) {
      table.filterGeometry = view.extent;
    } else {
      table.filterGeometry = null;
    }
  });

  document.getElementById("query_attrs").addEventListener("click", () => {
    let querywhere = "";

    for (let j = 1; j < 4; j++) {
      let thefieldid = "Field" + j;
      let theoperatorid = "Operator" + j;
      let valueid = "Value" + j;
      let before = "Before" + j;
      let after = "After" + j;
      let addquery = "AddQuery" + (j - 1);
      var valueselected = "";

      // if (selectedItems.length > 0) {
      //   alert(`Selected Value(s): ${selectedItems.join(", ")}`);
      // } else {
      //   alert("No value has been selected.");
      // }
      if (document.getElementById(thefieldid)) {
        const selectedItems = document
          .getElementById(thefieldid)
          .selectedItems.map((item) => item.value);
        if (selectedItems.length > 0) {
          fieldvalue = document.getElementById(thefieldid).value;
        }
      } else {
        continue;
      }
      //check if populated value selected
      if (document.getElementById(valueid).value === "") {
        //if empty then get typed value
        const Comboboxvalue = document.getElementById(valueid);
        console.log(
          Comboboxvalue.shadowRoot.querySelectorAll(".input")[0].value
        );
        valueselected =
          Comboboxvalue.shadowRoot.querySelectorAll(".input")[0].value;
      } else {
        valueselected = document.getElementById(valueid).value;
      }

      if (
        document.getElementById(thefieldid) &&
        document.getElementById(thefieldid).value != "" &&
        document.getElementById(theoperatorid).value != "" &&
        (valueselected != "" ||
          (document.getElementById(before).value != "" &&
            document.getElementById(after).value != ""))
      ) {
        let condition = document.getElementById(theoperatorid).value;
        let beforevalue = document.getElementById(before).value;
        let aftervalue = document.getElementById(after).value;
        let value = valueselected;
        let fieldtype = field1type.toUpperCase();
        let operation = "";
        operation = getcondtionstatement(
          fieldtype,
          condition,
          value,
          beforevalue,
          aftervalue
        );
        if (j === 1) {
          querywhere = fieldvalue + " " + operation;
        } else if (j > 1) {
          var allcombo = document.getElementsByTagName("calcite-combobox");
          // for (let j = 0; j < allcombo.length; j++) {
          //    // console.log(allcombo[j].id);
          // }
          let theAndOr = document.getElementById(addquery).value;
          querywhere += " " + theAndOr + " " + fieldvalue + " " + operation;
        }
      } else {
        if (document.getElementById(thefieldid)) {
          document.getElementById("Message_html").innerHTML =
            "All fields in the query need to be completed";
          console.log(notice);
          notice.open = true;
          return;
        }
      }
    }
    console.log(querywhere);
    getQuery(querywhere);
  });

  const getQuery = async (SQLwhere) => {
    let thelayer = theselectedlayer;
    let query = thelayer.createQuery();
    query.where = SQLwhere;
    let thevalues = [];
    // query.orderByFields = selectedField;
    query.outFields = ["*"];
    query.returnDistinctValues = false;
    query.returnGeometry = true;
    // let promise = thelayer.queryFeatures(query).then(function (response) {
    //   console.log(response);
    // });
    thelayer
      .queryFeatures(query)

      .then((results) => {
        //let numberofgraphics = results.features.length;
        console.log(results);
        if (results.features.length === 0) {
          document.getElementById("Message_html").innerHTML =
            "Query returned no features.";
          console.log(notice);
          notice.open = true;
          return;
        }

        // if (table) {
        //    table.selectRows(results.features);
        //  }
        let graphics = results.features;
        // numberofgraphics = graphics.length;

        //console.log(featureTable);

        console.log(graphics);
        let thegeometrytype = thelayer.geometryType;

        var pointSymbol = new SimpleMarkerSymbol({
          style: "circle",
          color: "blue",
          size: "10px",
        });

        var polylineSymbol = new SimpleLineSymbol({
          color: [255, 0, 0],
          width: 4,
          style: "solid",
        });

        var polygonSymbol = {
          type: "simple-fill",
          color: [227, 139, 79, 0.8], // Orange, opacity 80%
          outline: {
            color: [0, 0, 0],
            width: 4,
          },
        };

        var rendererPt = new SimpleRenderer({ symbol: pointSymbol });
        var rendererLine = new SimpleRenderer({ symbol: polylineSymbol });
        var rendererPolygon = new SimpleRenderer({ symbol: polygonSymbol });
        let thetitle = "Query Results for: " + thelayer.title;
        const layer = new FeatureLayer({
          // source: testgraphics,
          source: graphics, // array of graphics objects
          objectIdField: "OBJECTID",
          geometryType: thegeometrytype,
          title: thetitle,
          fields: thelayer.fields,
        });

        if (layer.geometryType === "point") {
          layer.renderer = rendererPt;
        } else if (layer.geometryType === "polygon") {
          layer.renderer = rendererPolygon;
        } else if (layer.geometryType === "polyline") {
          layer.renderer = rendererLine;
        }
        layer.spatialReference = view.spatialReference;
        map.add(layer);
        zoomToLayer(layer);
      });
  };

  function zoomToLayer(layer) {
    return layer.queryExtent().then((response) => {
      view.goTo(response.extent).catch((error) => {
        console.error(error);
      });
    });
  }

  const getcondtionstatement = (
    fieldtype,
    condition,
    value,
    beforevalue,
    aftervalue
  ) => {
    let operation = "";
    if (fieldtype === "STRING") {
      if (condition.toUpperCase() === "IS") {
        operation = " = '" + value + "'";
      }
      if (condition.toUpperCase() === "IS NOT") {
        operation = " <> '" + value + "'";
      }
      if (condition.toUpperCase() === "START WITH") {
        operation = " LIKE '" + value + "%'";
      }
      if (condition.toUpperCase() === "END WITH") {
        operation = "LIKE  '%" + value + "'";
      }
      if (condition.toUpperCase() === "CONTAINS") {
        operation = "LIKE  '%" + value + "%'";
      }
      if (condition.toUpperCase() === "DOES NOT CONTAIN") {
        operation = " NOT LIKE  '%" + value + "%'";
      }
      if (condition.toUpperCase() === "IS BLANK") {
        operation = " IS NULL ";
      }
      if (condition.toUpperCase() === "IS NOT BLANK") {
        operation = " IS NOT NULL ";
      }
    } else if (
      fieldtype === "INTEGER" ||
      fieldtype === "DOUBLE" ||
      fieldtype === "OID" ||
      fieldtype === "SMALL-INTEGER" ||
      fieldtype === "SINGLE" ||
      fieldtype === "LONG" ||
      fieldtype === "GUID" ||
      fieldtype === "GLOBAL-ID"
    ) {
      console.log(condition.toUpperCase());
      switch (condition.toUpperCase()) {
        case "IS":
          operation = " = " + value;
          break;
        case "IS NOT":
          operation = " <> " + value;
          break;
        case "IS AT LEAST":
          operation = " >= " + value;
          break;
        case "IS LESS THAN":
          operation = " < " + value;
          break;
        case "SI AT MOST":
          operation = " <= " + value;
          break;
        case "IS GREATER THAN":
          operation = " > " + value;
          break;
        case "IS BETWEEN":
          operation = " BETWEEN " + beforevalue + " AND " + aftervalue;
          break;
        case "IS NOT BETWEEN":
          operation = " NOT BETWEEN " + beforevalue + " AND " + aftervalue;
          break;
        case "IS BLANK":
          operation = " IS NULL";
          break;
        case "IS NOT BLANK":
          operation = " IS NOT NULL";
          break;
      }
    }
    return operation;
  };

  // document.getElementById("selectbygeom").addEventListener("click", () => {
  //   view.closePopup();
  //   sketchViewModel.create("rectangle");
  // });

  // Add the widget to the top-right corner of the view

  // Filter valid 2D basemaps using Basemap.fromId
  const valid2DBasemaps = new Collection(
    allowed2DBasemaps
      .map((id) => {
        try {
          return Basemap.fromId(id);
        } catch (error) {
          console.warn(`Invalid basemap ID: ${id}`);
          return null;
        }
      })
      .filter(Boolean) // Remove null entries
  );

  // Create the BasemapGallery widget
  const basemapGallery = new BasemapGallery({
    view: view,
    source: valid2DBasemaps, // Use filtered valid basemaps
    container: "basemaps-container",
  });

  // const basemapGalleryContainer = document.getElementById("basemaps-container");
  // const toggleBasemapGallery = document.getElementById("basemaps");

  // toggleBasemapGallery.addEventListener("click", () => {
  //   const isVisible = basemapGalleryContainer.style.display === "block";
  //   basemapGalleryContainer.style.display = isVisible ? "none" : "block";
  //   if (isVisible) {
  //     main(view, 49); // When the container is hidden
  //   } else {
  //     main(view, 400); // When the container is visible
  //   }
  // });

  const layerList = new LayerList({
    view,
    selectionEnabled: true,
    listItemCreatedFunction: defineActions,
    container: "layers-container",
  });

  const legend = new Legend({
    view,
    container: "legend-container",
  });

  const elevationProfile = new ElevationProfile({
    container: "elevation-node",
    view: view,
    unit: "feet",
    profiles: [
      {
        // displays elevation values from Map.ground
        type: "ground", //autocasts as new ElevationProfileLineGround()
        color: "red", // display this profile in red
        title: "World elevation", // with a custom label
      },
    ],
    visibleElements: {
      selectButton: false,
    },
  });

  //elevationvisible = false;

  const measurement = new Measurement({
    view: view,
    areaUnit: "square-miles",
    linearUnit: "miles",
  });

  const sketch = new Sketch({
    container: "sketch-node",
    layer: graphicsLayer,
    view: view,
    // graphic will be selected as soon as it is created
    creationMode: "update",
  });
  map.add(graphicsLayer);

  // set table full width at start
  document.getElementById("center-row").style.height = 300 + "px";
  var thewidth1 = window.innerWidth - 100;
  document.getElementById("center-row").style.width = thewidth1 + "px";

  // Creates actions in the LayerList.

  async function defineActions(event) {
    // The event object contains an item property.
    // is is a ListItem referencing the associated layer
    // and other properties. You can control the visibility of the
    // item, its title, and actions using this object.

    const item = event.item;

    await item.layer.when();

    if (event.item.layer.type === "feature") {
      item.actionsSections = [
        [
          {
            title: "Table",
            className: "esri-icon-table",
            id: "show-table",
          },
        ],
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
    } else {
      item.actionsSections = [
        [
          {
            title: "Go to full extent",
            className: "esri-icon-zoom-out-fixed",
            id: "full-extent",
          },
          {
            title: "Layer information",
            className: "esri-icon-description",
            id: "information",
          },
          // {
          //   title: "Download Layer",
          //   className: "esri-icon-download",
          //   id: "downloadLayer",
          // },
          {
            title: "Remove Layer",
            className: "esri-icon-download",
            id: "removeLayer",
          },
        ],
      ];
    }
    // }
    // }

    // Adds a slider for updating a group layer's opacity
    //if (item.children.length > 1 && item.parent) {
    const slider = new Slider({
      min: 0,
      max: 1,
      precision: 2,
      values: [1],
      visibleElements: {
        labels: true,
        rangeLabels: true,
      },
    });

    item.panel = {
      content: slider,
      className: "esri-icon-sliders-horizontal",
      title: "Change layer opacity",
    };

    slider.on("thumb-drag", (event) => {
      const { value } = event;
      item.layer.opacity = value;
    });
    // }
  }

  // let layerList = new LayerList({
  //   view: view,
  //   container: "layerlist-node",
  //   selectionEnabled: true,
  //   listItemCreatedFunction: defineActions,
  // });
  // // Adds widget below other elements in the top left corner of the view
  // // view.ui.add(layerList, {
  // //   position: "top-right",
  // // });

  layerList.on("trigger-action", (event) => {
    // The layer visible in the view at the time of the trigger.
    var visibleLayer = event.item.layer;
    // Capture the action id.
    const id = event.action.id;

    if (id === "full-extent") {
      // if the full-extent action is triggered then navigate
      // to the full extent of the visible layer
      view.goTo(visibleLayer.fullExtent).catch((error) => {
        if (error.name != "AbortError") {
          console.error(error);
        }
      });
    } else if (id === "show-table") {
      // layer = item.layer;
      document.getElementById("center-row").collapsed = false;
      // if (table) removeTable();

      createTable(visibleLayer);
      table_panel();
    } else if (id === "information") {
      // if the information action is triggered, then
      // open the item details page of the service layer
      if (!visibleLayer.url) {
        document.getElementById("Message_html").innerHTML =
          "There is no REST service for this layer";
        notice.open = true;
        return;
      }
      window.open(visibleLayer.url + "/" + visibleLayer.layerId);
      // } else if (id === "increase-opacity") {
      //   // if the increase-opacity action is triggered, then
      //   // increase the opacity of the GroupLayer by 0.25

      //   if (visibleLayer.opacity < 1) {
      //     visibleLayer.opacity += 0.25;
      //   }
      // } else if (id === "decrease-opacity") {
      //   // if the decrease-opacity action is triggered, then
      //   // decrease the opacity of the GroupLayer by 0.25

      //   if (visibleLayer.opacity > 0) {
      //     visibleLayer.opacity -= 0.25;
      //   }
    } else if (id === "downloadLayer") {
      downloadFeatureLayerAsGeoJSON(visibleLayer);
    } else if (id === "removeLayer") {
      let thelayer = visibleLayer.url + "/" + visibleLayer.layerId;
      for (let i = 0; i < layers_config.layers.length; i++) {
        console.log(layers_config.layers[i].url);
        if (layers_config.layers[i].url === thelayer) {
          document.getElementById("Message_html").innerHTML =
            "Please turn off this layer using the Layer List widget.";
          notice.open = true;
          return;
        }
      }
      map.remove(visibleLayer);
    }
  });

  async function downloadFeatureLayerAsGeoJSON(layer) {
    if (!layer.url) {
      const features = layer.source.items; // Get the features from the source

      if (!features || features.length === 0) {
        alert("No features to export.");
        return;
      }

      try {
        const featureSet = await layer.queryFeatures({
          where: "1=1", // Query all features
          outFields: ["*"], // Retrieve all fields
          returnGeometry: true,
        });

        // Convert features to ESRI JSON format
        const esriJSON = featureSet.features; // Correctly access features

        // Create a Blob from the JSON string
        const blob = new Blob([JSON.stringify(esriJSON)], {
          type: "application/json",
        });

        // Create a download link
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "feature-layer.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error querying features:", error);
      }
    } else {
      const featureLayerURL = `${layer.url}/${layer.layerId}`;
      const queryParameters = {
        f: "geojson",
        where: "1=1",
        outFields: "*",
        returnGeometry: true,
        resultOffset: 0,
        resultRecordCount: 1000, // Adjust this based on server max records per request
      };

      let totalRecords = await getFeatureCount();

      if (totalRecords > 0) {
        await fetchAllFeatures(totalRecords);
      } else {
        console.warn("No records found to download.");
      }

      async function getFeatureCount() {
        try {
          const countUrl = `${featureLayerURL}/query?where=1=1&returnCountOnly=true&f=json`;
          const response = await fetch(countUrl);
          if (!response.ok) throw new Error("Error fetching feature count.");

          const data = await response.json();
          if (data.count !== undefined) {
            console.log("Total feature count:", data.count);
            return data.count;
          } else {
            throw new Error("Count not found in the response.");
          }
        } catch (error) {
          console.error("Error fetching feature count:", error);
          return 0; // Prevent undefined values
        }
      }

      async function fetchAllFeatures(totalRecords) {
        let allFeatures = [];
        let offset = 0;
        let batchFeatures;

        const loadingOverlay = document.getElementById("loadingOverlay");
        const completionElement = document.getElementById("completion");
        if (loadingOverlay) loadingOverlay.style.display = "block";

        try {
          do {
            const url =
              `${featureLayerURL}/query?` +
              new URLSearchParams({
                ...queryParameters,
                resultOffset: offset,
              });

            const response = await fetch(url);
            if (!response.ok) throw new Error("Network response was not ok");

            const data = await response.json();
            batchFeatures = data.features || [];

            allFeatures = allFeatures.concat(batchFeatures);

            if (completionElement) {
              const percentage = (allFeatures.length / totalRecords) * 100;
              completionElement.innerHTML = `${percentage.toFixed(
                2
              )}% records downloaded.`;
            }

            offset += queryParameters.resultRecordCount;
          } while (
            batchFeatures.length === queryParameters.resultRecordCount &&
            batchFeatures.length > 0
          );

          // Fetch layer info
          const layerInfo = await fetch(`${featureLayerURL}?f=json`).then(
            (res) => res.json()
          );

          // Create final JSON structure
          const json = {
            type: "FeatureCollection",
            features: allFeatures,
          };

          // Download the JSON
          downloadJSON(json);
        } catch (error) {
          console.error("Failed to fetch features:", error);
        } finally {
          if (loadingOverlay) loadingOverlay.style.display = "none";
        }
      }

      function downloadJSON(json) {
        const blob = new Blob([JSON.stringify(json)], {
          type: "application/json",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "feature-layer.json"; // Ensure a consistent file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }

  ///  ADD EVENT LISTENERS ///////////////////////
  document
    .getElementById("plot_FLlayer")
    .addEventListener("click", function (event) {
      plot_FL(event);
    });

  document
    .getElementById("plot_CSVlayer")
    .addEventListener("click", function (event) {
      plot_CSVlayer(event);
    });

  document
    .getElementById("plot_KMLlayer")
    .addEventListener("click", function (event) {
      plot_KMLlayer(event);
    });

  document
    .getElementById("plot_WebMap_layers")
    .addEventListener("click", function (event) {
      plot_WebMap_Layers(event);
    });
  

  document
    .getElementById("add_data_option")
    .addEventListener("calciteRadioButtonGroupChange", function (event) {
      actionAddData(event);
    });



  const actionBarEl = document.getElementById("action-bar-left");
  const actionBarEl2 = document.getElementById("action-bar-right");

  (async () => {
    await customElements.whenDefined("calcite-action");
    const actions = [...document.getElementsByTagName("calcite-action")];
    addTooltips(actions);
  })();

  function addTooltips(actions) {
    actions.forEach((action) => {
      const tooltipEl = document.createElement("calcite-tooltip");
      tooltipEl.label = action.text;
      tooltipEl.referenceElement = action.id;
      tooltipEl.innerHTML = `<span> ${action.text} </span>`;
      actionBarEl.appendChild(tooltipEl);
      actionBarEl2.appendChild(tooltipEl);
    });
  }

  const open_addlayers_btn = document.querySelector("#addlayers_widget");  
  const add_data_btn = document.querySelector("#add_data_widget");
  const query_attrs_btn = document.querySelector("#query_attrs_widget");
  const query_geom_btn = document.querySelector("#query_geom_widget");
  const measurement_btn = document.querySelector("#measurement_widget");
  const sketch_btn = document.querySelector("#Sketch_widget");
 
  const elevation_btn = document.querySelector("#elevation_widget");
  const session_btn = document.querySelector("#session_widget");

  const add_layer_panel = document.querySelector("#add_layers_panel");
  const add_data_panel = document.querySelector("#add_data_panel");
  const query_attrs_panel = document.querySelector("#query_attrs_panel");
  const query_geom_panel = document.querySelector("#query_geom_panel");
  const measurement_panel = document.querySelector("#measurement_panel");
  const session_panel = document.querySelector("#session_panel");

  const layers_panel = document.getElementById("layers_side");
  const print_panel = document.getElementById("print_side");
  const basemaps_panel = document.getElementById("basemaps_side");
  const legend_panel = document.getElementById("legend_side");

  const sketch_panel = document.querySelector("#sketch_panel");
  const elevation_panel = document.querySelector("#elevation_panel");
  //const basemaps_panel = document.querySelector("#basemaps_panel");
  //const legend_panel = document.querySelector("#legend_panel");
  const layerlist_panel = document.querySelector("#layerlist_panel");

  fetch(
	"./docs/AddLayer.json"
  )
    .then((response) => response.json())
    .then((data) => {
      layersCount = data.layers.length;

      layersCount_nowater = data.layers.filter(
        (entry) =>
          !entry.subject.includes("SLR") && !entry.subject.includes("Coastal")
      ).length;
   

      total_layer_heading = `<span style=" font-weight: bold;font-size:medium">Add Library Layers. </span><span style="color: blue; font-weight: bold; font-size:small">Just ${layersCount} to choose from!</span> `;
      total_layer_heading_nowater = `<span style=" font-weight: bold;font-size:medium">Add Library Layers. </span><span style="color: blue; font-weight: bold; font-size:small">Just ${layersCount_nowater} to choose from!</span> `;

      const headingElement = document.getElementById("custom-heading");
      headingElement.innerHTML = total_layer_heading;
    });

  layers_panel.addEventListener("calcitePanelClose", () => {
    document.getElementById("shell-panel-start").collapsed = true;
    full_table();
  });
  print_panel.addEventListener("calcitePanelClose", () => {
    document.getElementById("shell-panel-start").collapsed = true;
    full_table();
  });
  basemaps_panel.addEventListener("calcitePanelClose", () => {
    document.getElementById("shell-panel-start").collapsed = true;
    full_table();
  });
  legend_panel.addEventListener("calcitePanelClose", () => {
    document.getElementById("shell-panel-start").collapsed = true;
    full_table();
  });
  shellPanel.addEventListener("calcitePanelClose", () => {
    document.getElementById("shell-panel-start").collapsed = true;
    main(view, 49);
  });

  document
    .getElementById("clear_query_entries")
    .addEventListener("click", () => reset_query_comboboxes());

  function reset_query_comboboxes() {
    // var allcombo = document.getElementsByTagName("calcite-combobox");
    // for (let j = 0; j < allcombo.length; j++) {
    //   document.getElementById(allcombo[j].id).value = null;
    // }
    //console.log(firstqueryon);
    firstqueryon = true;
    document.getElementById("LayerQuery").innerText = null;
    listLayers("LayerQuery");

    const divElement = document.getElementById("QueryListing");
    divElement.replaceChildren();

    // for (let i = 1; i < querycounter + 1; i++) {
    //   let thediv = "Query" + i;
    //   if (document.getElementById(thediv)) {
    //     const containerDiv = document.getElementById(thediv);
    //     const eventListeners = new Map();
    //     //document.getElementById(thediv).remove();
    //     const allComboboxes = containerDiv.querySelectorAll('calcite-combobox');
    //     allComboboxes.forEach(combobox => {
    //       const eventListener = (event) => {
    //         console.log(`Combobox ${combobox.id || "unnamed"} changed:`, event.detail);
    //       };
    //       eventListeners.set(combobox, eventListener);

    //       // Remove the event listener
    //       combobox.removeEventListener("calciteComboboxChange", eventListener);

    //       // Reset the combobox
    //       combobox.selectedItems = [];

    //       // Reattach the event listener
    //       combobox.addEventListener("calciteComboboxChange", eventListener);
    //     });
    //   }
    //   if (i>1){
    //     document.getElementById(thediv).remove()
    //   }

    // }
  }

  document
    .getElementById("clear_query_graphics")
    .addEventListener("click", () => {
      //Query Results
      view.map.layers.forEach((layer) => {
        let thetitle = layer.title;
        if (thetitle && thetitle.includes("Query Results")) {
          map.remove(layer);
        }
      });
      view.extent = initial_extent;
      view.goTo({
        center: [-119.475, 37.737],
        zoom: 7,
      });
    });

  open_addlayers_btn.addEventListener("click", function () {
    close_widgets();
    add_layer_panel.closed = false;
    document.getElementById("add_layers_panel").style.display = "block";
    load_layer_names("name");
  });
  add_layer_panel.addEventListener("calcitePanelClose", () => close_widgets());

  measurement_btn.addEventListener("click", function () {
    close_widgets();
    measurement_panel.closed = false;
    document.getElementById("measurement_panel").style.display = "block";
  });
  measurement_panel.addEventListener("calcitePanelClose", () =>
    close_widgets()
  );

  sketch_btn.addEventListener("click", function () {
    close_widgets();
    sketch_panel.closed = false;
    document.getElementById("sketch_panel").style.display = "block";
  });
  sketch_panel.addEventListener("calcitePanelClose", () => close_widgets());


  


  elevation_btn.addEventListener("click", function () {
    close_widgets();
    elevation_panel.closed = false;
    document.getElementById("elevation_panel").style.display = "block";
  });
  elevation_panel.addEventListener("calcitePanelClose", () => close_widgets());

  session_btn.addEventListener("click", function () {
    close_widgets();
    session_panel.closed = false;
    document.getElementById("session_panel").style.display = "block";
  });
  session_panel.addEventListener("calcitePanelClose", () => close_widgets());

 
  add_data_btn.addEventListener("click", function () {
    close_widgets();
    add_data_panel.closed = false;
    document.getElementById("add_data_panel").style.display = "block";
  });
  add_data_panel.addEventListener("calcitePanelClose", () => close_widgets());

  query_attrs_btn.addEventListener("click", function () {
    close_widgets();
    reset_query_comboboxes();
    query_attrs_panel.closed = false;
    document.getElementById("query_attrs_panel").style.display = "block";
  });
  query_attrs_panel.addEventListener("calcitePanelClose", () =>
    close_widgets()
  );

  query_geom_btn.addEventListener("click", function () {
    close_widgets();
    reset_query_comboboxes();
    query_geom_panel.closed = false;
    document.getElementById("query_geom_panel").style.display = "block";
    listLayers("LayerQuery_geom");
  });
  query_geom_panel.addEventListener("calcitePanelClose", () => close_widgets());

  add_data_btn.addEventListener("click", function () {
    close_widgets();
    add_data_panel.closed = false;
    document.getElementById("add_data_panel").style.display = "block";
  });
  add_data_panel.addEventListener("calcitePanelClose", () => close_widgets());

  query_attrs_panel.addEventListener("calcitePanelClose", () =>
    close_widgets()
  );
  query_attrs_panel.addEventListener(
    "click",
    () => (query_attrs_panel.closed = false)
  );

  query_geom_panel.addEventListener("calcitePanelClose", () => close_widgets());
  query_geom_panel.addEventListener(
    "click",
    () => (query_geom_panel.closed = false)
  );

  session_panel.addEventListener("calcitePanelClose", () => close_widgets());
  session_panel.addEventListener("click", () => (session_panel.closed = false));

  measurement_panel.addEventListener("calcitePanelClose", () =>
    close_widgets()
  );
  measurement_panel.addEventListener(
    "click",
    () => (measurement_panel.closed = false)
  );

  sketch_panel.addEventListener("calcitePanelClose", () => close_widgets());
  sketch_panel.addEventListener("click", () => (sketch_panel.closed = false));
;

  elevation_panel.addEventListener("calcitePanelClose", () => close_widgets());
  elevation_panel.addEventListener(
    "click",
    () => (elevation_panel.closed = false)
  );

  // basemaps_panel.addEventListener("calcitePanelClose", () => close_widgets());
  // basemaps_panel.addEventListener(
  //   "click",
  //   () => (basemaps_panel.closed = false)
  // );
  // legend_panel.addEventListener("calcitePanelClose", () => close_widgets());
  // legend_panel.addEventListener("click", () => (legend_panel.closed = false));
  layerlist_panel.addEventListener("calcitePanelClose", () => close_widgets());
  layerlist_panel.addEventListener(
    "click",
    () => (layerlist_panel.closed = false)
  );


  ///////////////    Action     //////////////////////////////////////////////////////////////////

  async function load_layer_names(property) {
    document.getElementById("layer_search").value = null;
    var layer_selection = document.getElementById("layer_search");
   
    const url = "./docs/AddLayer.json"
    try {
      const response = await fetch(url);
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
      //   console.log(document.getElementById("layer_search").value)
      var layerName = document.getElementById("layer_search").value;

     
      const jsonUrl = "./docs/AddLayer.json"
      openTabsByName(layerName, jsonUrl);
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

      // Example Usage
      const tabHierarchy = listTopLevelTabsAndChildren();
      // console.log("Hierarchy of Tabs and Their Children:", tabHierarchy);

      for (const item of tabHierarchy) {
        // console.log(item.parent + "  " + item.children);
        if (item.children.includes(subject)) {
          const parent = item.parent;
          //   console.log(parent);
          activateNestedTab(parent, subject);
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
  /*   function activateNestedTab(parentTabName, childTabName) {
    // Activate the parent tab first   
    activateTabByName(parentTabName);
  
    // Wait for the nested tabs to render
    const observer = new MutationObserver((mutationsList, observer) => {
      const nestedTabs = document.querySelector("calcite-tab[active] calcite-tabs");
  
      if (nestedTabs) {
        activateTabByName(childTabName);
        observer.disconnect(); // Stop observing once the child tab is activated
      }
    });
  
    // Observe changes in the DOM to detect when the nested tabs are rendered
    const parentTabContent = document.querySelector("calcite-tab[active]");
    if (parentTabContent) {
      observer.observe(parentTabContent, { childList: true, subtree: true });
    }   
  } */

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

  document.querySelector("calcite-shell").hidden = false;
  //document.querySelector("calcite-loader").active = false;
  // setTimeout(() => {
  //   document.querySelector(".tab2").removeAttribute("active");
  //   document.querySelector(".tab1").setAttribute("active", true);
  // }, 10);



  document
    .getElementById("theAddDatatabs")
    .addEventListener("calciteTabChange", function (event) {
      // clear_entries();
      view.closePopup();
      //clear_form_input();
      clear_buffer_lys();
     
      if (document.getElementById("add_data_panel").style.display === "block") {
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
  }

  ///////////////    END OF addEventListeners    //////////////////////////////////////////////////////////////////
  // function addJSONToMap(file) {
  //   const reader = new FileReader();

  //   reader.onload = function (e) {
  //     try {
  //       const jsonData = JSON.parse(e.target.result);
  //       addFeatureLayer(jsonData);
  //     } catch (err) {
  //       alert("Error parsing JSON file: " + err.message);
  //     }
  //   };
  //   reader.readAsText(file);
  // }

  // // Add a FeatureLayer to the map from JSON
  // // Add a FeatureLayer to the map from JSON
  // function addFeatureLayer(jsonData) {
  //   if (!jsonData.features || !jsonData.fields || !jsonData.geometryType) {
  //     alert(
  //       "Invalid JSON format. Please provide a valid ESRI Feature Layer JSON."
  //     );
  //     console.error("JSON is missing required properties:", jsonData);
  //     return;
  //   }

  //   function mapFieldType(esriType) {
  //     const typeMap = {
  //       esriFieldTypeOID: "oid",
  //       esriFieldTypeInteger: "integer",
  //       esriFieldTypeSmallInteger: "small-integer",
  //       esriFieldTypeDouble: "double",
  //       esriFieldTypeSingle: "single",
  //       esriFieldTypeString: "string",
  //       esriFieldTypeDate: "date",
  //       esriFieldTypeGeometry: "geometry",
  //       esriFieldTypeGUID: "guid",
  //       esriFieldTypeBlob: "blob",
  //       esriFieldTypeGlobalID: "global-id",
  //       esriFieldTypeRaster: "raster",
  //       esriFieldTypeXML: "xml",
  //     };
  //     return typeMap[esriType] || "string"; // Default to "string" if the type is unknown
  //   }

  //   const geometryType = mapGeometryType(jsonData.geometryType);

  //   const updatedFeatures = jsonData.features
  //     .map((feature) => {
  //       let geometry = feature.geometry || {};
  //       if (!geometry.type) {
  //         geometry.type = inferGeometryType(geometry); // Infer the type dynamically
  //       }

  //       // Skip invalid features
  //       if (!geometry.type) {
  //         console.warn("Geometry could not be inferred for feature:", feature);
  //         return null;
  //       }

  //       return {
  //         geometry: geometry,
  //         attributes: feature.attributes,
  //       };
  //     })
  //     .filter((feature) => feature !== null); // Remove invalid features

  //   const popupTemplate = {
  //     title: "Feature from Uploaded JSON", // Change to an attribute from your data
  //     content: validFields
  //       .map(
  //         (field) => `<b>${field.alias || field.name}:</b> {${field.name}}<br>`
  //       )
  //       .join(""),
  //   };

  //   // Define a default renderer based on geometry type
  //   const renderer = getDefaultRenderer(geometryType);

  //   try {
  //     const featureLayer = new FeatureLayer({
  //       title: "Uploaded JSON file",
  //       source: updatedFeatures,
  //       fields: validFields,
  //       geometryType: geometryType,
  //       spatialReference: jsonData.spatialReference || { wkid: 4326 },
  //       popupTemplate: popupTemplate,
  //       renderer: renderer,
  //     });

  //     map.add(featureLayer);
  //     console.log(featureLayer.renderer);
  //     document.getElementById("loadingOverlay3").style.display = "none";
  //     // Zoom to the layer's extent
  //     featureLayer.queryExtent().then((response) => {
  //       if (response.extent) {
  //         view.goTo(response.extent);
  //       }
  //     });
  //   } catch (error) {
  //     console.error("Error creating FeatureLayer:", error);
  //     alert("Error creating FeatureLayer. See console for details.");
  //     document.getElementById("loadingOverlay3").style.display = "none";
  //   }
  // }

  // Function to map ESRI geometry types to ArcGIS API-compatible geometry types
  // function mapGeometryType(esriType) {
  //   const typeMap = {
  //     esriGeometryPolygon: "polygon",
  //     esriGeometryPoint: "point",
  //     esriGeometryPolyline: "polyline",
  //     esriGeometryMultipoint: "multipoint",
  //     esriGeometryMultipatch: "multipatch",
  //     esriGeometryMesh: "mesh",
  //   };
  //   return typeMap[esriType] || esriType; // Default to the original type if not mapped
  // }

  // Function to map field types to valid ArcGIS API types
  function mapFieldType(esriType) {
    const typeMap = {
      esriFieldTypeOID: "oid",
      esriFieldTypeInteger: "integer",
      esriFieldTypeSmallInteger: "small-integer",
      esriFieldTypeDouble: "double",
      esriFieldTypeSingle: "single",
      esriFieldTypeString: "string",
      esriFieldTypeDate: "date",
      esriFieldTypeGeometry: "geometry",
      esriFieldTypeGUID: "guid",
      esriFieldTypeBlob: "blob",
      esriFieldTypeGlobalID: "global-id",
      esriFieldTypeRaster: "raster",
      esriFieldTypeXML: "xml",
    };
    return typeMap[esriType] || "string"; // Default to "string" if the type is unknown
  }

  // Function to infer the geometry type from geometry object
  function inferGeometryType(geometry) {
    if (geometry.rings) {
      return "polygon";
    } else if (geometry.paths) {
      return "polyline";
    } else if (geometry.x !== undefined && geometry.y !== undefined) {
      return "point";
    } else if (
      geometry.xmin !== undefined &&
      geometry.ymin !== undefined &&
      geometry.xmax !== undefined &&
      geometry.ymax !== undefined
    ) {
      return "extent";
    } else {
      console.warn("Unknown geometry type", geometry);
      return null;
    }
  }

  // Function to generate a default renderer based on geometry type
  function getDefaultRenderer(geometryType) {
    if (geometryType === "polygon") {
      return new SimpleRenderer({
        symbol: new SimpleFillSymbol({
          color: [0, 0, 255, 0.8], // Orange fill
          outline: new SimpleLineSymbol({
            color: [0, 0, 0], // White outline
            width: 1,
          }),
        }),
      });
    } else if (geometryType === "point") {
      return new SimpleRenderer({
        symbol: new SimpleMarkerSymbol({
          color: [0, 120, 200, 0.8], // Blue marker
          size: 8,
        }),
      });
    } else if (geometryType === "polyline") {
      return new SimpleRenderer({
        symbol: new SimpleLineSymbol({
          color: [0, 120, 200], // Blue line
          width: 2,
        }),
      });
    } else {
      console.warn("No default renderer for geometry type:", geometryType);
      return null;
    }
  }

  /////////////////////////////////////////////////////////

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
        map.add(pointLayer);
        pointLayer
          .when(() => {
            return pointLayer.queryExtent();
          })
          .then((response) => {
            view.goTo({
              target: pointFeatures,
            });
            view.zoom = 20;
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
        map.add(lineLayer);
        lineLayer
          .when(() => {
            return lineLayer.queryExtent();
          })
          .then((response) => {
            view.goTo({
              target: lineFeatures,
            });
            view.zoom = 20;
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
        map.add(polygonLayer);
        polygonLayer
          .when(() => {
            return polygonLayer.queryExtent();
          })
          .then((response) => {
            view.goTo({
              target: polygonFeatures,
            });
            view.zoom = 20;
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
          map.add(csvLayer);
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

          map.add(featureLayer);
        })
        .catch((error) => {
          console.error("Error converting shapefile to JSON:", error);
        });
    };

    reader.readAsArrayBuffer(file);
  }


  view.on("click", function (event) {
    if (
      document.getElementById("measurement_panel").style.display === "block"
    ) {
      event.stopPropagation();
      //   setTimeout(function(){
      //   shellPanel.collapsed = true;
      // },1);
    }
    if (document.getElementById("sketch_panel").style.display === "block") {
      event.stopPropagation();     
    }   
  });

  async function handleAddLayersWidgetClick(district_json) {
    close_widgets();

    view.graphics.removeAll();
   

    document.getElementById("add_layers_panel").style.display = "block";
    load_layer_names("name");

    var options = {
      query: {
        f: "json",
      },
      responseType: "json",
    };
    if (district_json === "HQ") {
      var add_layers_json =
	  "./docs/AddLayer.json"
    }
    //

    layers_config = null;
    await esriRequest(
      add_layers_json,
      options
    ).then((response) => {
      layers_config = response.data;
      //console.log(layers_config);
      var layer_subject = [];
      layer_subject.length = 0;
      var thecontent = [];
      thecontent.length = 0;
      var layer_name = "";
      let no_water_districts = [2, 3, 6, 8, 9, 10];
      if (old_subject.length > 0) {
        for (let m = 0; m < old_subject.length; m++) {
          if (document.getElementById(old_subject[m])) {
            document.getElementById(old_subject[m]).innerHTML = "";
            //console.log(old_subject[m] + "  " + m)
          }
        }
      }
      for (let i = 0; i < layers_config.layers.length; i++) {
        layer_name = layers_config.layers[i].name;
        let layer_url = layers_config.layers[i].url;
        layer_subject[i] = layers_config.layers[i].subject;
        // if (layers_config.layers[i].subject.includes("Coastal")){
        //   alert("NO")
        // }
        //  console.log(layer_subject[i])
        //  console.log(parseInt(DIST_SELECTED))
        
        if (!thecontent[layer_subject[i]]) {
          thecontent[layer_subject[i]] =
            '<div class="combos1"><input type="checkbox" id="' +
            layer_name +
            '" value="' +
            layer_url +
            '" onclick=\'window.loadLayer("' +
            i +
            "\")'/>";
        } else {
          thecontent[layer_subject[i]] +=
            '<div class="combos1"><input type="checkbox" id="' +
            layer_name +
            '" value="' +
            layer_url +
            '" onclick=\'window.loadLayer("' +
            i +
            "\")'/>";
        }
        thecontent[layer_subject[i]] +=
          '<label for="' +
          layer_name +
          '">&nbsp;' +
          layer_name +
          "</label></div>";
      }
      old_subject = [];
      old_subject.length = 0;
      old_subject = layer_subject;
      for (let k = 0; k < layer_subject.length; k++) {
        // console.log(layer_subject[k])

        if (document.getElementById(layer_subject[k])) {
          document.getElementById(layer_subject[k]).innerHTML =
            thecontent[layer_subject[k]] + "<br>";
        }
      }
    });
  }

  window.showLayerInfo = function (index) {
    var showLayerInfo = layers_config.layers[index].url;
    window.open(showLayerInfo, "_blank");
  };

  window.showLayerTable = function (index) {
    document.getElementById("center-row").collapsed = false;

    // const gridfields = []
    view.map.layers.map(function (lyr) {
      // console.log(lyr)
      if (lyr.id === index.toString()) {
        if (table) {
          removeTable();
          table.watch("layer", () => highlightHandles?.removeAll());
        }
        createTable(lyr);
      }
    });
  };

  window.loadLayer = function (index) {
    var list;
    list = document.getElementsByClassName("fakeClass");
    for (let j = 0; j < list.length; ++j) {
      document.getElementById(list[j].id).style.display = "none";
    }
    if (table) {
      //table.highlightIds.removeAll();
      table.filterGeometry = null;
      removeTable();
      // if (polygonGraphicsLayer) {
      //   polygonGraphicsLayer.removeAll();
      // }
    }

    //window.selected_layer  = "showTableTag_" + index;
    var thelayer = layers_config.layers[index];

    if (document.getElementById(thelayer.name).checked) {
      //  document.getElementById(window.selected_layer).display = "";

      //console.log("AddLayer :: addLayerToMap :: begin for layer = ", thelayer);
      var layerType = thelayer.type.toUpperCase();

      switch (layerType) {
        case "DYNAMIC":
          addDynamicLayerToMap(thelayer);
          break;
        case "FEATURE":
          addFeatureLayerToMap(thelayer);
          break;
        case "TILED":
          addTiledLayerToMap(thelayer);
          break;
        case "WMS":
          addWMSLayerToMap(thelayer);
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
      view.map.layers.map(function (lyr) {
        // console.log(thelayer.type);
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
          map.remove(lyr);
          return;
        } else {
          let fullurl = lyr.url + "/" + lyr.layerId;
          if (
            lyr.name === thelayer.name ||
            lyr.id === thelayer.name ||
            lyr.url === thelayer.url ||
            fullurl === thelayer.url
          ) {
            map.remove(lyr);

            return;
          }
        }
      });
    }
  };

  function addTiledLayerToMap(thelayer) {
    const TiledL = new TileLayer({
      url: thelayer.url,
    });

    if (thelayer.hasOwnProperty("opacity")) {
      TiledL.opacity = thelayer.opacity;
    }
    if (thelayer.hasOwnProperty("visible") && !thelayer.visible) {
      TiledL.visible = false;
    } else {
      TiledL.visible = true;
    }

    if (thelayer.hasOwnProperty("imageformat")) {
      TiledL.imageFormat = thelayer.imageFormat;
    }

    let TiledLcount = 0;
    view.map.layers.forEach((layer) => {
      if (layer.type == "dynamic") {
        TiledLcount += 1;
      }
    });

    TiledL.when(() => {
      TiledL.allSublayers.forEach((sublayer) => {
        sublayer.popupEnabled = true;
      });
    });

    map.add(TiledL);
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
        map.add(layer);
      });
    } else {
      arr.sort(function (a, b) {
        return b - a;
      });
      console.log(arr);

      map.add(layer);
      await layer.loadAll();
      var thesublayer = null;
      layer.load().then(() => {
        layer.allSublayers.map((sublayer) => {
          sublayer.visible = false;
          sublayer.popupEnabled = true;          
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

  function addFeatureLayerToMap(thelayer) {
    //console.log(thelayer.type + "  " + thelayer.url)
    const fl = new FeatureLayer({
      url: thelayer.url,
      name: thelayer.name || thelayer.title,
      outFields: ["*"],
    });
    // fl.when(() => {
    //   console.log(fl.fields)
    // })
    // fl.outFields = ["*"];

    // console.log(thelayer.type + "  " + thelayer.url)
    // console.log(fl.type + "  " + fl.url)

    // console.log(thelayer);
    if (fl.name) {
      fl.title = fl.name;
    }

  
    if (thelayer.hasOwnProperty("opacity")) {
      fl.opacity = thelayer.opacity;
    }
    if (thelayer.hasOwnProperty("visible") && !thelayer.visible) {
      fl.visible = false;
    } else {
      fl.visible = true;
    }
    // if (thelayer.name) {
    //   fl.id = thelayer.name;
    // }

    // if (thelayer.name.includes("BLM Lands")) {
    //   fl.definitionExpression =
    //     "Agency= + 'United States Bureau of Land Management'";
    // }

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

    map.add(fl);

    fl.load().then(() => {
      // console.log(fl.fields)
      if (renderer && !fl.renderer) {
        fl.renderer = renderer;
      }

      // fl.fields.map((field) => (
      // console.log(field.name + "  " + field.alias)
      // ))
      const fieldInfos = fl.fields.map((field) => ({
        fieldName: field.name,
        label: field.alias || field.name,
      }));
      // console.log(fieldInfos);
      // console.log(fl.renderer);
      fl.popupTemplate = {
        title: thelayer.name, // Customize with the appropriate field if available
        content: [
          {
            type: "fields",
            fieldInfos: fieldInfos,
          },
        ],
      };
      // const popupTemplate = fl.createPopupTemplate();
      // fl.popupTemplate = popupTemplate;
      // var layerid = "table_icon" + index;
      // document.getElementById(layerid).style.display = "block";
      //console.log(fl)
    });

    //count featurelayers on map
    //console.log(view.map.layers.length);
    // flcount = 0;
    // view.map.layers.forEach((layer) => {
    //   if (layer.type == "feature") {
    //     flcount += 1;
    //   }
    // });

    // const graphic = {
    //   popupTemplate: {
    //     content: "Mouse over features to show details...",
    //   },
    // };

    // fl.when(() => {
    //   //go to layer extent if it is the first layer on map
    //   if (flcount < 1) {
    //     view.whenLayerView(fl).then(function (layerView) {
    //       featureLayerView = layerView;
    //     });
    //     //view.goTo(fl.fullExtent);
    //   }
    // });

    //setup options from config file
    // fl.url = thelayer.url;

    //console.log(fl.layerId)

    // fl.refresh(); // adds the layer to the map
  }


  
  function clear_entries() {
    //view.popup.autoOpenEnabled = false;
    //view.popup.close()
    //remove visibility of all options
   

    document.getElementById("add_data_panel").style.display = "none";
    document.getElementById("query_attrs_panel").style.display = "none";
    document.getElementById("query_geom_panel").style.display = "none";
    document.getElementById("session_panel").style.display = "none";
    document.getElementById("measurement_panel").style.display = "none";
    document.getElementById("sketch_panel").style.display = "none";
    document.getElementById("elevation_panel").style.display = "none";
    // document.getElementById("basemaps_panel").style.display = "none";
    // document.getElementById("legend_panel").style.display = "none";
    document.getElementById("layerlist_panel").style.display = "none";
   

   
  }

  
  function clear_buffer_lys() {
    view.graphics.removeAll();
    view.map.layers.map(function (lyr) {
      //console.log(lyr.id);
      
    });
  }
  


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

          var thePoint = new Point(
            thecoords,
            new SpatialReference({
              wkid: 4326,
            })
          );

          if (document.getElementById("spot_radioXY").checked) {
            var thetitle = "PM Spot from XY";
          } else {
            var thetitle = "Nearest Clicked Location";
          }

          var thegraphic = new Graphic({
            geometry: thePoint,
            symbol: pointSymbol,
            popupTemplate: {
              title: thetitle,
              content: content,
            },
          });

          PMClickedgraphics.add(thegraphic);
          if (!document.getElementById("spot_radioXY").checked) {
            // Ensure the layer view is ready before fetching features
            view.whenLayerView(PMClickedgraphics).then((layerView) => {
              view.when(() => {
                setTimeout(() => {
                  // Directly assign the newly added graphic instead of fetchFeatures
                  featuresWidget.features = [thegraphic]; // Direct assignment
                  featuresWidget.visible = true;

                  // Ensure UI elements are displayed properly
                  document.getElementById("features-widget").style.display =
                    "block";
                  shellPanel.collapsed = false;
                  main(view, 400);
                }, 500); // Delay to ensure rendering
              });
            });

            //  view.graphics.add(thegraphic);
          } else {
            view.graphics.add(thegraphic);
          }
        }
      }
    }
  }

  function actionPMtoXY(event) {
    clear_entries();
    view.closePopup();
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

  function plot_KMLlayer() {
    const kmlLayer = new KMLLayer({
      url: document.getElementById("KML_URL").value,
      popupTemplate: {
        // Popup Template for features in the KML file
        title: "{name}", // Display the name attribute from the KML file
        content: `
          <b>Coordinates:</b> {geometry.coordinates}
          <br>
          <b>Description:</b> {description}`,
      },
    });

    // Add KML layer to the map
    map.add(kmlLayer);
    // Zoom to the extent of the KML layer once it loads
    kmlLayer
      .when(() => {
        const extent = kmlLayer.fullExtent;
        if (extent) {
          view
            .goTo(extent)
            .catch((error) =>
              console.error("Error zooming to extent: ", error)
            );
        } else {
          console.warn("KML layer extent is null. Using default extent.");
          view.goTo({
            center: [-119.4179, 36.7783],
            zoom: 6,
          });
        }
      })
      .catch((error) => console.error("Error loading KML layer: ", error));

    kmlLayer.on("error", function (event) {
      console.error("Error with KML layer: ", event.error);
    });
  }

  function plot_CSVlayer() {
    console.log(document.getElementById("CSV_URL").value);
    const csvLayer = new CSVLayer({
      url: document.getElementById("CSV_URL").value,
      //   title: "CSV Layer",
      //   popupTemplate: {
      //     title: "Feature Information",
      //     content: "{*}" // Display all attributes in the popup
      // }
    });
    map.add(csvLayer);
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
      })
      .catch((error) => {
        console.error("Error loading CSV Layer:", error);
      });
  }

  document.getElementById("FL_URL").addEventListener("click", () => {
    document.getElementById("line-controls").style.display = "none";
  });

  function plot_FL() {
    if (document.getElementById("FL_URL").value === "") {
      document.getElementById("Message_html").innerHTML =
        "Please enter the url for the feature layer!";
      notice.open = true;
      return;
    }
    let url = document.getElementById("FL_URL").value;
    esriRequest(url, {
      query: { f: "json" },
      responseType: "json",
    })
      .then((response) => {
        const metadata = response.data;

        // Check if the service is a MapImageLayer (MapServer)
        console.log(metadata);
        if (
          (metadata.layers || metadata.subLayers) &&
          metadata.type != "Feature Layer"
        ) {
          console.log("This is a MapImageLayer with sublayers");
          const mapImageLayer = new MapImageLayer({
            url: url,
          });
          map.add(mapImageLayer);
          mapImageLayer.when(() => {
            mapImageLayer.sublayers.forEach((sublayer) => {
              if (sublayer) {
                sublayer.popupEnabled = true;
                sublayer.popupTemplate = {
                  title: `{${sublayer.title}}`,
                  content: function (feature) {
                    let attributes = feature.graphic.attributes;
                    let contentHtml = "<table>";
                    for (let key in attributes) {
                      contentHtml += `<tr><td><strong>${key}</strong></td><td>${attributes[key]}</td></tr>`;
                    }
                    contentHtml += "</table>";
                    return contentHtml;
                  },
                };
              }
            });
          });

          // Log sublayer information
          console.log("Sublayers:", metadata.layers || metadata.subLayers);
        }
        // Check if the layer is a FeatureLayer
        else if (metadata.type === "Feature Layer") {
          console.log("This is a FeatureLayer");
          document.getElementById("line-controls").style.display = "block";

          const fl = new FeatureLayer({
            url: document.getElementById("FL_URL").value,
          });
          map.add(fl);
          fl.load().then(() => {
            renderer = fl.renderer;
            setInitialControls(renderer);

            // Set the event to apply color and width changes
            document
              .getElementById("applyChanges")
              .addEventListener("click", () => {
                const color = document.getElementById("colorPicker").value;
                const width = parseFloat(
                  document.getElementById("lineWidth").value
                );
                updateRenderer(renderer, color, width);
              });

            function setInitialControls(renderer) {
              // Check renderer type to set the initial values based on the symbology
              if (renderer.type === "simple") {
                // For SimpleRenderer, use symbol properties
                const symbol = renderer.symbol;
                setControlValues(
                  symbol.color,
                  symbol.outline ? symbol.outline.width : symbol.width
                );
              } else if (renderer.type === "unique-value") {
                // For UniqueValueRenderer, take the first symbol as initial value
                const symbol = renderer.uniqueValueInfos[0].symbol;
                setControlValues(
                  symbol.color,
                  symbol.outline ? symbol.outline.width : symbol.width
                );
              } else if (renderer.type === "class-breaks") {
                // For ClassBreaksRenderer, take the first symbol as initial value
                const symbol = renderer.classBreakInfos[0].symbol;
                setControlValues(
                  symbol.color,
                  symbol.outline ? symbol.outline.width : symbol.width
                );
              }
            }

            function setControlValues(color, width) {
              // Set initial color and width in the controls
              document.getElementById("colorPicker").value = color.toHex
                ? color.toHex()
                : "#000000";
              document.getElementById("lineWidth").value = width || 1;
            }

            function updateRenderer(renderer, colorHex, lineWidth) {
              // Convert color hex to array of RGBA values
              const colorArray = hexToRGBA(colorHex);

              if (renderer.type === "simple") {
                updateSymbol(renderer.symbol, colorArray, lineWidth);
              } else if (renderer.type === "unique-value") {
                renderer.uniqueValueInfos.forEach((info) => {
                  updateSymbol(info.symbol, colorArray, lineWidth);
                });
              } else if (renderer.type === "class-breaks") {
                renderer.classBreakInfos.forEach((info) => {
                  updateSymbol(info.symbol, colorArray, lineWidth);
                });
              }

              layer.renderer = renderer;
            }

            function updateSymbol(symbol, colorArray, lineWidth) {
              if (symbol.type === "simple-marker") {
                symbol.color = colorArray;
                symbol.outline.width = lineWidth;
              } else if (symbol.type === "simple-line") {
                symbol.color = colorArray;
                symbol.width = lineWidth;
              } else if (symbol.type === "simple-fill") {
                symbol.color = colorArray;
                symbol.outline.width = lineWidth;
              }
            }

            function hexToRGBA(hex) {
              // Convert hex color to RGBA array
              const r = parseInt(hex.slice(1, 3), 16);
              const g = parseInt(hex.slice(3, 5), 16);
              const b = parseInt(hex.slice(5, 7), 16);
              return [r, g, b, 1]; // Full opacity
            }
          });
        } else {
          console.log("Unknown layer type or unsupported layer");
          console.log("Service Metadata:", metadata);
        }
      })
      .catch((error) => {
        console.error("Error fetching layer info:", error);
      });
  }

  function plot_WebMap_Layers() {
    if (
      document.getElementById("portal_URL").value === "" ||
      document.getElementById("portal_id").value === ""
    ) {
      document.getElementById("Message_html").innerHTML =
        "Please enter the info for the WebMap!";
      notice.open = true;
      return;
    }

    esriConfig.portalUrl = document.getElementById("portal_URL").value;

    webmap = new WebMap({
      portalItem: {
        id: document.getElementById("portal_id").value,
      },
    });

    webmap
      .load()
      .then(() => {
        console.log("Webmap loaded. Attempting to load layers...");

        // Create an array of promises for loading each layer
        const layerLoadPromises = webmap.layers.map((layer) =>
          layer
            .load()
            .then(() => {
              if (layer.loadStatus === "loaded") {
                console.log(`Layer ${layer.id} loaded successfully.`);
                return layer; // Return the layer if successfully loaded
              } else {
                console.warn(
                  `Layer ${layer.id} failed with status: '${layer.loadStatus}'`
                );
                return null; // Return null for failed layers
              }
            })
            .catch((error) => {
              console.warn(`Layer ${layer.id} failed to load:`, error);
              return null; // Return null for layers with errors
            })
        );

        // Process all layer load promises
        Promise.allSettled(layerLoadPromises).then((results) => {
          const layersToAdd = results
            .filter(
              (result) => result.status === "fulfilled" && result.value !== null
            ) // Only take successfully loaded layers
            .map((result) => result.value);

          console.log("Adding successfully loaded layers to the map...");
          layersToAdd.forEach((layer) => map.add(layer));
        });
      })
      .catch((error) => {
        console.error("Error loading the webmap:", error);
      });
  }



  function actionAddData(event) {
    //clear_entries();
    view.closePopup();
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

  function actionXYtoPM(event) {
    clear_entries();
    view.closePopup();
    var allinput = document.getElementsByTagName("calcite-input");
    for (let i = 0; i < allinput.length; i++) {
      allinput[i].value = "";
    }

    // console.log(event);
    if (event.target.selectedItem.value === "spot_radioXY") {
      document.getElementById("spot_XY").style.display = "block";
      document.getElementById("ending_XYinfo").style.display = "none";
      document.getElementById("action_XY").style.display = "block";
    } else {
      document.getElementById("spot_XY").style.display = "block";
      document.getElementById("ending_XYinfo").style.display = "block";
      document.getElementById("action_XY").style.display = "block";
    }
  }


  document
    .getElementById("LayerQuery_geom")
    .addEventListener("calciteComboboxChange", function (event) {
      for (let item of event.target.selectedItems) {
        selectedcomboboxquery_geom = item.textLabel;
      }

      view.closePopup();
      //g(document.getElementById("LayerQuery_geom").value);

      view.map.layers.map(function (lyr) {
        if (lyr.url === document.getElementById("LayerQuery_geom").value) {
          view.whenLayerView(lyr).then((layerView) => {
            featureLayerView = layerView;
          });
          theselectedlayer = lyr;
          document.getElementById("sketch_info").style.display = "block";
        }
        // console.log(lyr);
      });
      //view.whenLayerView(fl).then(function (layerView) {
    });

  document
    .getElementById("LayerQuery")
    .addEventListener("calciteComboboxChange", function (event) {
      if (firstqueryon) {
        CreateQuery(1);
        firstqueryon = false;
        querycounter = 1;
      }
    });

  function CreateQuery(id) {
    console.log(thediv + "  " + thefieldid);

    let before = "Before" + id;
    let after = "After" + id;
    let AND = "AND" + id;
    let theQueryListing = document.getElementById("QueryListing");
    thediv = document.createElement("div");
    const combosfield = document.createElement("div");
    const combosoperator = document.createElement("div");
    const combosbefore = document.createElement("div");
    const combosafter = document.createElement("div");
    const combosAND = document.createElement("div");
    const combosAddQuery = document.createElement("div");
    const Value = document.createElement("div");
    const thefield = document.createElement("calcite-combobox");
    const theoperator = document.createElement("calcite-combobox");
    const thebefore = document.createElement("calcite-combobox");
    const theafter = document.createElement("calcite-combobox");
    const theAND = document.createElement("calcite-label");
    const thevalue = document.createElement("calcite-combobox");
    const AddQuery = document.createElement("calcite-combobox");

    //query
    let thequeryid = "Query" + id;
    thediv.setAttribute("id", thequeryid);
    thediv.setAttribute("style", "margin: 10px");
    theQueryListing.appendChild(thediv);

    //field
    thefieldid = "Field" + id;
    combosfield.setAttribute("class", "combos");
    thediv.appendChild(combosfield);
    thefield.setAttribute("scale", "s");
    thefield.setAttribute("id", thefieldid);
    thefield.setAttribute("label", thefieldid);
    thefield.setAttribute("placeholder", "Field?");
    thefield.setAttribute("max-items", 8);
    thefield.setAttribute("style", "width: 180px");
    thefield.setAttribute("selection-mode", "single");
    combosfield.appendChild(thefield);

    listFields(id);

    thefield.addEventListener("calciteComboboxChange", (event) => {
      thefieldname = "";
      var selectedField = fieldselection.value;
      theselectedlayer.fields.forEach((field) => {
        thefieldname = field.name.toUpperCase();
        if (thefieldname === selectedField.toUpperCase()) {
          selected_fieldtype = field.type;
          showconditions(selected_fieldtype, id);
          if (id === 1) {
            field1type = selected_fieldtype;
          } else if (id === 2) {
            field2type = selected_fieldtype;
          } else if (id === 3) {
            field3type = selected_fieldtype;
          }
        }
      });
    });

    //operator
    let theoperatorid = "Operator" + id;
    combosoperator.setAttribute("class", "combos");
    thediv.appendChild(combosoperator);
    theoperator.setAttribute("scale", "s");
    theoperator.setAttribute("id", theoperatorid);
    theoperator.setAttribute("label", theoperatorid);
    theoperator.setAttribute("placeholder", "Operator?");
    theoperator.setAttribute("max-items", 8);
    theoperator.setAttribute("style", "width: 120px");
    theoperator.setAttribute("selection-mode", "single");
    combosoperator.appendChild(theoperator);

    operatorselection = document.getElementById(theoperatorid);
    theoperator.addEventListener("calciteComboboxChange", function (event) {
      // console.log(event.target);
      selectedoperation = operatorselection.value;
      if (selectedoperation.includes("between")) {
        combosbefore.style.display = "";
        combosAND.style.display = "";
        combosafter.style.display = "";
        Value.style.display = "none";
      } else {
        combosbefore.style.display = "none";
        combosAND.style.display = "none";
        combosafter.style.display = "none";
        Value.style.display = "";
      }
      listValues(id);
    });

    //beforeANDafter

    combosbefore.setAttribute("class", "combos");
    combosbefore.setAttribute("style", "display: none");
    combosafter.setAttribute("class", "combos");
    combosafter.setAttribute("style", "display: none");
    combosAND.setAttribute("class", "combos");
    combosAND.setAttribute("id", AND);
    combosAND.setAttribute(
      "style",
      "padding-top: 5px; align-items: center; text-align: center;display: none;"
    );

    thediv.appendChild(combosbefore);
    thebefore.setAttribute("scale", "s");
    thebefore.setAttribute("id", before);
    thebefore.setAttribute("label", before);
    thebefore.setAttribute("placeholder", "");
    thebefore.setAttribute("max-items", 8);
    thebefore.setAttribute("style", "width: 120px");
    thebefore.setAttribute("selection-mode", "single");
    combosbefore.appendChild(thebefore);

    thediv.appendChild(combosAND);
    //theAND.setAttribute("innerHTML","AND")
    theAND.innerHTML = "AND";
    combosAND.appendChild(theAND);

    thediv.appendChild(combosafter);
    theafter.setAttribute("scale", "s");
    theafter.setAttribute("id", after);
    theafter.setAttribute("label", after);
    theafter.setAttribute("placeholder", "");
    theafter.setAttribute("max-items", 8);
    theafter.setAttribute("style", "width: 120px");
    theafter.setAttribute("selection-mode", "single");
    combosafter.appendChild(theafter);

    //value
    //thediv.appendChild(document.createElement("br"));
    let valueid = "Value" + id;
    Value.setAttribute("class", "combos");
    //Value.setAttribute("style","argin-top: 15px; margin-bottom: 20px;")
    thediv.appendChild(Value);
    thevalue.setAttribute("scale", "s");
    thevalue.setAttribute("id", valueid);
    thevalue.setAttribute("label", valueid);
    thevalue.setAttribute("allow-custom-values", true);
    thevalue.setAttribute("placeholder", "value?");
    thevalue.setAttribute("max-items", 8);
    thevalue.setAttribute("style", "width: 180px");
    thevalue.setAttribute("selection-mode", "single");
    Value.appendChild(thevalue);

    thediv.appendChild(document.createElement("br"));
    thediv.appendChild(document.createElement("br"));
    combosAddQuery.setAttribute(
      "class",
      "margin-top: 15px; margin-bottom: 20px;"
    );
    // console.log(id);
    //limit of 3 queries. Last one, no need for "AND" dropdown
    if (id < 3) {
      let AddQueryid = "AddQuery" + id;
      thediv.appendChild(combosAddQuery);
      AddQuery.setAttribute("scale", "s");
      AddQuery.setAttribute("id", AddQueryid);
      AddQuery.setAttribute("label", AddQueryid);
      AddQuery.setAttribute("placeholder", "Add?");
      AddQuery.setAttribute("style", "width: 80px");
      AddQuery.setAttribute("selection-mode", "single");
      AddQuery.setAttribute("style", " width: 100px;");
      combosAddQuery.appendChild(AddQuery);
      const AndOption = document.createElement("calcite-combobox-item");
      AndOption.setAttribute("value", "AND");
      AndOption.setAttribute("text-label", "AND");
      AddQuery.appendChild(AndOption);
      const OrOption = document.createElement("calcite-combobox-item");
      OrOption.setAttribute("value", "Or");
      OrOption.setAttribute("text-label", "Or");
      AddQuery.appendChild(OrOption);

      AddQuery.addEventListener("calciteComboboxChange", function (event) {
        AddQuery_event(event);
      });
    }
  }

  function AddQuery_event(e) {
    // console.log(e);

    let theField = "Field" + querycounter;
    let theOperator = "Operator" + querycounter;
    let theValue = "Value" + querycounter;
    let theBefore = "Before" + querycounter;
    let theAfter = "After" + querycounter;
    if (querycounter < 3) {
      if (
        document.getElementById(theField).value != "" &&
        document.getElementById(theOperator).value != "" &&
        (document.getElementById(theValue).value != "" ||
          (document.getElementById(theBefore).value != "" &&
            document.getElementById(theAfter).value != ""))
      ) {
        querycounter += 1;
        //   document.getElementById(temp).addEventListener(e.id, function() {
        CreateQuery(querycounter);
      } else {
        document.getElementById("Message_html").innerHTML =
          "All fields in previous query need to be completed";
        //console.log(notice);
        notice.open = true;
      }
    } else if (querycounter > 2) {
      document.getElementById("Message_html").innerHTML =
        "You are allowed max 3 queries";
      notice.open = true;
    }
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

    let dist = Number(document.getElementById("buffer_dist").value);
    const buffer = geometryEngine.geodesicBuffer(
      graphic.geometry,
      dist,
      "miles"
    );
    console.log(buffer);
    let bufferGraphic = new Graphic({ geometry: buffer, symbol: sym });
    // add graphic to map
    if (graphicsLayer_buffer) {
      map.remove(graphicsLayer_buffer);
    }
    graphicsLayer_buffer = new GraphicsLayer({
      id: "Buffer_graphic",
      title: "Buffer graphic",
      listMode: "hide",
      //   listMode: "hide",
      // });
    });
    graphicsLayer_buffer.add(bufferGraphic);

    map.add(graphicsLayer_buffer);
  }

  function listLayers(comboName) {
    // console.log(comboName)

    // view.popup.close();
    view.closePopup();
    clearcombobox(comboName);
    let maplayers = [];
    maplayers.length = 0;
    layerselection = "";
    layerselection = document.getElementById(comboName);

    if (view.map.layers.length === 0) {
      alert("Load at least one layer to the map");
    } else {
      view.map.layers.map(function (lyr) {
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
            maplayers.push({
              label: lyr.title,
              value: lyr.url,
            });
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

  async function listFields(id) {
    layerselection = document.getElementById("LayerQuery");
    // console.log(layerselection.value);
    let thefieldid = "Field" + id;
    fieldselection = document.getElementById(thefieldid);
    // let thefield = "Field" + id;
    await view.map.layers.map(function (lyr) {
      // console.log(lyr);
      if (lyr.url === layerselection.value) {
        theselectedlayer = lyr;
        let fields = [];
        fields.length = 0;
        var layerType = theselectedlayer.type.toUpperCase();
        //  console.log(layerType);
        if (layerType === "FEATURE") {
          let fieldList = null;
          theselectedlayer.load().then(() => {
            theselectedlayer.fields.forEach((field) => {
              // console.log(field.name.toUpperCase());
              if (
                field.type.toUpperCase() != "GEOMETRY" &&
                !field.name.toUpperCase().includes("SHAPE") &&
                field.type.toUpperCase() != "DATE"
              ) {
                thefieldname =
                  field.name + " (" + field.type.toUpperCase() + ")";
                fields.push({
                  label: thefieldname,
                  value: field.name,
                  type: field.type,
                });
              }
            });
            //   return fieldsvalues
            clearcombobox(thefieldid);
            for (let item of fields) {
              const comboItem = document.createElement("calcite-combobox-item");
              comboItem.setAttribute("value", item.value);
              comboItem.setAttribute("text-label", item.label);
              //thefield.appendChild(comboItem);
              fieldselection.appendChild(comboItem);
            }
          });
        } else {
          alert(
            "At this time Attribute Widget is available only for feature layers"
          );
        }
      }
    });
  }

  function listValues(id) {
    let thelayer = theselectedlayer;
    let thefieldid = "Field" + id;
    let valueid = "Value" + id;
    let before = "Before" + id;
    let after = "After" + id;

    let selectedField = "";
    let queryfield = "";

    let beforeselection = document.getElementById(before);
    let afterselection = document.getElementById(after);
    valueselection = document.getElementById(valueid);
    fieldselection = document.getElementById(thefieldid);
    //console.log(layerselection.value);
    thefieldname = fieldselection.value;

    queryfield = thefieldname;
    var thetype = selected_fieldtype;
    //console.log(queryfield);

    let query = thelayer.createQuery();
    query.where = "1=1";
    let thevalues = [];
    query.orderByFields = queryfield;
    query.outFields = queryfield;
    query.returnDistinctValues = true;
    query.returnGeometry = false;

    let promise = thelayer.queryFeatures(query).then(function (response) {
      // console.log(response);
      response.features.map((item) => {
        //   console.log(item.attributes[queryfield]);
        if (
          thetype.toUpperCase() === "DATE" &&
          typeof item.attributes[queryfield] == "number"
        ) {
          var formatdate = new Date(
            item.attributes[queryfield]
          ).toLocaleDateString("en-us", { year: "numeric", month: "short" });

          //  console.log(typeof item.attributes[queryfield]);
          thevalues.push({
            label: formatdate,
            value: item.attributes[queryfield],
          });
        } else {
          thevalues.push({
            label: item.attributes[queryfield],
            value: item.attributes[queryfield],
          });
        }
      });
      return thevalues;
    });

    clearcombobox(valueid);
    //clearcombobox("BeforeDiv")
    //clearcombobox("AfterDiv")

    promise.then(() => {
      for (let item of thevalues) {
        const comboItem = document.createElement("calcite-combobox-item");
        const comboItem1 = document.createElement("calcite-combobox-item");
        comboItem.setAttribute("value", item.value);
        comboItem.setAttribute("text-label", item.label);
        comboItem1.setAttribute("value", item.value);
        comboItem1.setAttribute("text-label", item.label);
        if (selectedoperation.includes("between")) {
          beforeselection.appendChild(comboItem);
          afterselection.appendChild(comboItem1);
        } else {
          valueselection.appendChild(comboItem);
        }
      }
    });
  }

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

  function showconditions(thetype, id) {
    // console.log(thetype);

    let string_conditions = [
      "is",
      "is not",
      "start with",
      "end with",
      "contains",
      "does not contain",
      "is blank",
      "is not blank",
    ];
    let number_conditions = [
      "is",
      "is not",
      "is at least",
      "is less than",
      "is at most",
      "is greater than",
      "is between",
      "is not between",
      "is blank",
      "is not blank",
    ];
    let date_conditions = [
      "is on",
      "is not on ",
      // "is in",
      //  "is not in",
      "is before",
      "is after",
      "is on or before",
      "is on or after",
      "is between",
      "is not between",
      "is blank",
      "is not blank",
    ];

    let selection_type = thetype.toUpperCase();

    if (
      selection_type.includes("INTEGER") ||
      selection_type.includes("DOUBLE") ||
      selection_type.includes("OID")
    ) {
      selection_type = "INTEGER";
    } else if (selection_type.includes("STRING")) {
      selection_type = "STRING";
    } else if (selection_type.includes("DATE")) {
      selection_type = "DATE";
    }

    let conditions = [];
    conditions.length = 0;
    switch (selection_type) {
      case "INTEGER":
        number_conditions.forEach((condition) => {
          conditions.push({
            label: condition,
            value: condition,
          });
        });

        break;
      case "DATE":
        date_conditions.forEach((condition) => {
          conditions.push({
            label: condition,
            value: condition,
          });
        });
        break;
      case "STRING":
        string_conditions.forEach((condition) => {
          conditions.push({
            label: condition,
            value: condition,
          });
        });
        break;
      default:
        console.warn();
        break;
    }
    let operator = "Operator" + id;
    operatorselection = document.getElementById(operator);
    clearcombobox(operator);
    for (let item of conditions) {
      const comboItem = document.createElement("calcite-combobox-item");
      comboItem.setAttribute("value", item.value);
      comboItem.setAttribute("text-label", item.label);
      operatorselection.appendChild(comboItem);
    }
  }

  // Containers that will hold the table
  document.getElementById("exportCSV").addEventListener("click", async () => {
    // const progressBar = document.getElementById("loadingOverlay2");
    // progressBar.style.display = "block"; // Show progress bar
    // progressBar.value = 0;

    const selectedRows = table.highlightIds;
    if (selectedRows.length > 0) {
      exportSelectedToCSV();
    } else {
      exportallTablerecords();
    }
  });

  async function exportallTablerecords() {
    let layer = table.layer;
    progressBar = document.getElementById("loadingOverlay2");
    progressBar.style.display = "block"; // Show progress bar
    progressBar.value = 0;

    const extent = view.extent; // Get current map extent
    const query = layer.createQuery();
    query.geometry = extent;
    query.outFields = ["*"]; // Retrieve all fields
    query.returnGeometry = false; // No geometry needed for CSV
    query.start = 0;

    const features = [];
    const maxRecordCount = layer.capabilities.query.maxRecordCount || 2000;

    let hasMore = true;
    while (hasMore) {
      // Query in chunks
      query.start = features.length;
      query.num = maxRecordCount;

      const response = await layer.queryFeatures(query);
      features.push(...response.features);

      progressBar.value =
        features.length /
        (response.exceededTransferLimit ? undefined : response.total); // Update progress

      if (!response.exceededTransferLimit) {
        hasMore = false;
      }
    }
    console.log(features);

    const geoJson = {
      type: "FeatureCollection",
      features: features.map((feature) => ({
        type: "Feature",
        properties: feature.attributes, // Attach attributes as properties
      })),
    };

    // Log or use the GeoJSON as needed
    console.log(geoJson);

    geoJsonToCsv(geoJson);

    // // Convert features to CSV
    // const csvData = features.map((feature) =>
    //   layer.fields.map((field) => feature.attributes[field.name]).join(",")
    // );

    // const csvContent = [
    //   layer.fields.map((field) => field.alias).join(","),
    //   ...csvData,
    // ].join("\n");

    // // Create a download link
    // const blob = new Blob([csvContent], { type: "text/csv" });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement("a");
    // a.href = url;
    // a.download = "features.csv";
    // a.click();

    //progressBar.style.display = "none"; // Hide progress bar after download
  }

  function geoJsonToCsv(geoJson) {
    // Extract headers (keys from properties)
    const headers = Object.keys(geoJson.features[0].properties);

    // Create CSV content
    const csvContent = [
      headers.join(","), // Join headers by comma
      ...geoJson.features.map((feature) =>
        headers
          .map((header) => JSON.stringify(feature.properties[header] || ""))
          .join(",")
      ),
    ].join("\n");

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    progressBar.style.display = "none"; // Hide progress bar after download
  }

  async function exportSelectedToCSV() {
    let layer = table.layer;
    try {
      // Retrieve selected rows from the FeatureTable
      const selectedRows = table.highlightIds; // IDs of selected rows

      if (!selectedRows || selectedRows.length === 0) {
        alert("No rows selected for export.");
        return;
      }

      // Query features using the selected ObjectIDs
      const query = layer.createQuery();
      query.objectIds = selectedRows; // Restrict query to selected ObjectIDs
      query.outFields = ["*"];
      query.returnGeometry = false;

      const result = await layer.queryFeatures(query);

      // Convert the selected features to CSV
      const features = result.features;
      if (!features.length) {
        alert("No features found to export.");
        return;
      }

      const csvContent = features.map((feature) => {
        return Object.values(feature.attributes).join(",");
      });
      csvContent.unshift(Object.keys(features[0].attributes).join(",")); // Add headers

      // Create a downloadable CSV file
      const blob = new Blob([csvContent.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "selected_features.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting selected features:", error);
    }
  }

  document
    .getElementById("close_table")
    .addEventListener("click", function (event) {
      document.getElementById("center-row").collapsed = true;
    });

  document
    .getElementById("increase-table-height")
    .addEventListener("click", function (event) {
      tableheight += 50;
      document.getElementById("center-row").style.height =
        300 + tableheight + "px";

      document.getElementById("decrease-table-height").style.display = "block";
    });

  document
    .getElementById("decrease-table-height")
    .addEventListener("click", function (event) {
      console.log(document.getElementById("center-row").style.height);
      let table_height = parseInt(
        document.getElementById("center-row").style.height,
        10
      );
      console.log(typeof table_height);

      if (table_height > 250 || isNaN(table_height)) {
        tableheight -= 50;
        document.getElementById("center-row").style.height =
          250 + tableheight + "px";
      } else {
        document.getElementById("decrease-table-height").style.display = "none";
      }
    });
  function removeTable() {
    document.getElementById("center-row").collapsed = true;
    if (table) {
    }
    // table?.clearHighlights();
    // tableContentArea.innerHTML = null;
    // Enable map popups when table is closed
    view.popup.autoOpenEnabled = true;
  }
  function showTable() {
    // Add the table to the map and open the panel
    document.getElementById("center-row").collapsed = false;
    // Disable map popups when table is open
    view.closePopup();
    view.popup.autoOpenEnabled = false;
    if (
      featuresWidget.collapsed ||
      document.getElementById("shell-panel-start").collapsed
    ) {
      full_table();
      main(view, 49);
    } else {
      table_panel();
      main(view, 400);
    }
  }

  function createTable(layer) {
    let div = document.getElementById("tableDiv");
    div.replaceChildren();

    const hiddenFields = new Collection();

    hiddenFields.add(layer?.objectIdField);

    table = new FeatureTable({
      view,
      columnReorderingEnabled: false,
      layer,
      id: layer.title,
      hiddenFields,
      multiSortEnabled: true,
      filterGeometry: view.extent,
      highlightEnabled: true,
      autoRefreshEnabled: true,
      visibleElements: {
        header: true,
        menu: true,
        selectionColumn: true,
        columnMenus: true,
        menuItems: {
          clearSelection: true,
          refreshData: true,
          toggleColumns: true,
          columnReorderingEnabled: true,
          selectedRecordsShowAllToggle: true,
          selectedRecordsShowSelectedToggle: true,
          zoomToSelection: true, //,
          // autoCloseMenu:true
        },
      },

      container: document.getElementById("tableDiv"),
    });

    showTable();
    reactiveUtils.when(
      () => view?.stationary,
      () => {
        if (view?.extent && !filter)
          if (document.getElementById("filter_map_extent").checked) {
            table.filterGeometry = view.extent;
          }
      },
      { initial: true }
    );

    table.watch("highlightIds.length", (ids) => {
      table.zoomToSelection();
    });
  }

  const sketchViewModel = new SketchViewModel({
    layer: sketchLayer,
    view: view,
    pointSymbol: {
      type: "simple-marker",
      style: "circle",
      size: 10,
      color: [255, 255, 255, 0.8],
      outline: {
        color: [255, 0, 0, 1],
        size: 10,
      },
    },
    polylineSymbol: {
      type: "simple-line",
      color: [211, 132, 80, 0.7],
      width: 6,
    },
    polygonSymbol: {
      type: "simple-fill",
      color: [227, 139, 79, 0.8], // Orange, opacity 80%
      outline: {
        color: [0, 0, 0],
        width: 4,
      },
    },
    defaultCreateOptions: { hasZ: false },
  });

  sketchViewModel.on(["create"], (event) => {
    // update the filter every time the user finishes drawing the filtergeometry
    if (event.state == "complete") {
      sketchGeometry = event.graphic.geometry;
      featureLayerViewFilterSelected = true;
      updateFilter();
    }
  });

  sketchViewModel.on(["update"], async (event) => {
    const eventInfo = event.toolEventInfo;
    const viewModel = layerList.viewModel;
    //console.log(layerList.operationalItems.getItemAt(0));
    // update the filter every time the user moves the filtergeometry
    if (event.toolEventInfo && event.toolEventInfo.type.includes("stop")) {
      const geometries = sketchLayer.graphics.map(function (graphic) {
        return graphic.geometry;
      });
      const queryGeometry = await geometryEngineAsync.union(
        geometries.toArray()
      );

      sketchGeometry = queryGeometry;
      updateFilter();
    }
  });

  // draw geometry buttons - use the selected geometry to sktech
  document
    .getElementById("point-geometry-button")
    .addEventListener("click", function (event) {
      if (selectedcomboboxquery_geom) {
        //  console.log(document.getElementById("LayerQuery_geom"));
        geometryButtonsClickHandler("point");
      } else {
        document.getElementById("Message_html").innerHTML =
          "Select a layer to query";
        notice.open = true;
      }
    });
  document
    .getElementById("line-geometry-button")
    .addEventListener("click", function (event) {
      if (selectedcomboboxquery_geom) {
        geometryButtonsClickHandler("polyline");
      } else {
        document.getElementById("Message_html").innerHTML =
          "Select a layer to query";
        notice.open = true;
      }
    });
  document
    .getElementById("polygon-geometry-button")
    .addEventListener("click", function (event) {
      if (selectedcomboboxquery_geom) {
        geometryButtonsClickHandler("polygon");
      } else {
        document.getElementById("Message_html").innerHTML =
          "Select a layer to query";
        notice.open = true;
      }
    });

  function geometryButtonsClickHandler(type) {
    const geometryType = type;
    clearFilter("yes");
    sketchViewModel.create(geometryType);
  }

  // get the selected spatialRelationship
  let selectedFilter = "disjoint";
  document
    .getElementById("relationship-select")
    .addEventListener("change", (event) => {
      const select = event.target;
      selectedFilter = select.options[select.selectedIndex].value;
      updateFilter();
    });

  // remove the filter
  document.getElementById("clearFilter").addEventListener("click", function () {
    clearFilter("yes");
  });

  function clearFilter(mode) {
    sketchGeometry = null;
    filterGeometry = null;
    filter = false;
    sketchLayer.removeAll();
    bufferLayer.removeAll();
    if (table) {
      table.highlightIds.removeAll();
    }
    if (featureLayerView) {
      featureLayerView.filter = null;
    }
    if (table && mode === "yes") removeTable();
    document.getElementById("bufferNum").value = 0;
    document.getElementById("relationship-select").value = "disjoint";
  }

  // set the geometry filter on the visible FeatureLayerView
  function updateFilter() {
    filterGeometry = null;
    console.log(sketchGeometry.type);
    filterGeometry = sketchGeometry;
    if (table && currentselectedlayer !== null) {
      if (currentselectedlayer.title != theselectedlayer.title) {
        //  createTable(theselectedlayer)
        table.layer = theselectedlayer;
      }
    } else {
      currentselectedlayer = theselectedlayer;
      createTable(theselectedlayer);
    }

    var ind = map.layers.findIndex((layer) => {
      return layer.id === "SketchLayer";
    });
    // console.log(ind);
    map.layers.reorder(map.layers.getItemAt(ind), map.layers.length - 1);

    // if (!table && currentselectedlayer && currentselectedlayer.title != theselectedlayer.title){
    // currentselectedlayer = theselectedlayer
    // createTable(theselectedlayer)
    // }
    showTable();
    updateFilterGeometry();

    // console.log(filterGeometry);
    if (featureLayerView) {
      const query = {
        geometry: filterGeometry,
        outFields: ["*"],
        spatialRelationship: "intersects",
        returnGeometry: true,
      };

      theselectedlayer.queryFeatures(query).then((results) => {
        var theObject;
        if (results.features.length === 0) {
          // clearSelection();
        } else {
          //  console.log(results.features);
          const fields = results.fields;
          for (const key in fields) {
            if (fields.hasOwnProperty(key)) {
              // Check if the property is on the object itself and not inherited
              const value = fields[key];
              //console.log(value.name, value.type);
              if (value.type === "oid") {
                //  console.log("done");
                theObject = value.name;
              }
            }
          }

          const validFeatures = results.features.map((feature) => ({
            geometry: feature.geometry,
            attributes: feature.attributes,
          }));

          var rendererPoint = new SimpleRenderer({ symbol: pointSymbol });
          var rendererLine = new SimpleRenderer({ symbol: polylineSymbol });
          var rendererPolygon = new SimpleRenderer({ symbol: polygonSymbol });
          var therenderer = null;
          if (sketchGeometry.type === "polygon") {
            therenderer = rendererPolygon;
          } else if (sketchGeometry.type === "point") {
            therenderer = rendererPoint;
          } else if (sketchGeometry.type === "polyline") {
            therenderer = rendererLine;
          }
          selectedFeatureLayer = new FeatureLayer({
            source: validFeatures, // Use the selected features as the source
            fields: theselectedlayer.fields, // Copy fields from the original layer
            objectIdField: theselectedlayer.objectIdField, // Set the ObjectID field
            geometryType: theselectedlayer.geometryType, // Match the geometry type
            spatialReference: theselectedlayer.spatialReference, // Match spatial reference
            renderer: therenderer, // Use the same renderer
            title: "Feature Layer selected records",
          });

          const selectedfields = selectedFeatureLayer.fields.map(
            (field) => field.name
          );
          const popupContent = selectedfields
            .map((field) => `<b>${field}:</b> {${field}}<br>`)
            .join("");

          selectedFeatureLayer.popupTemplate = {
            title: "{name}", // Customize with the appropriate field if available
            content: popupContent,
          };

          // Add the new FeatureLayer to the map
          map.add(selectedFeatureLayer);

          table.highlightIds.removeAll();
          let highlightIds = [];
          // filter the table based on the selection and only show those rows
          table.filterGeometry = filterGeometry;
          // Iterate through the features and push each individual result's OBJECTID to the highlightIds array

          results.features.forEach((feature) => {
            // highlightIds.push(feature.attributes.OBJECTID);
            var featureAttributes = feature.attributes;
            highlightIds.push(featureAttributes[theObject]);
          });
          // Set the highlightIds array to the highlightIds property of the featureTable
          table.highlightIds.addMany(highlightIds);
        }
      });
      filter = true;

      //   if (featureLayerViewFilterSelected) {
      //   //  featureLayerView.filter = featureFilter;
      //     console.log(featureLayerView)
      //   } else {
      //    // featureLayerView.filter = null;
      //   }
    }
  }

  // update the filter geometry depending on bufferSize

  function updateFilterGeometry() {
    bufferSize = document.getElementById("bufferNum").value;
    //console.log(bufferSize);
    // add a polygon graphic for the bufferSize
    if (sketchGeometry) {
      if (bufferSize > 0) {
        const bufferGeometry = geometryEngine.geodesicBuffer(
          sketchGeometry,
          bufferSize,
          "miles"
        );
        if (bufferLayer.graphics.length === 0) {
          bufferLayer.add(
            new Graphic({
              geometry: bufferGeometry,
              symbol: sketchViewModel.polygonSymbol,
            })
          );
        } else {
          bufferLayer.graphics.getItemAt(0).geometry = bufferGeometry;
        }
        filterGeometry = bufferGeometry;
      } else {
        bufferLayer.removeAll();
        filterGeometry = sketchGeometry;
      }
    }
  }

  // Set-up event handlers for buttons and click events
 
  distanceButton.addEventListener("click", () => {
    distanceMeasurement();
  });
  areaButton.addEventListener("click", () => {
    areaMeasurement();
  });
  clearButton.addEventListener("click", () => {
    clearMeasurements();
  });

  function distanceMeasurement() {
    view.popup.visible = false;
    measurement.activeTool = "distance";
    measurement.label = "distance";

    distanceButton.classList.add("active");
    areaButton.classList.remove("active");
  }

  // AreaMeasurement2D
  function areaMeasurement() {
    view.popup.visible = false;
    measurement.activeTool = "area";
    measurement.label = "area";
    distanceButton.classList.remove("active");
    areaButton.classList.add("active");
  }

  // Clears all measurements
  function clearMeasurements() {
    view.popup.visible = false;
    if (distanceButton) { 
      distanceButton.classList.remove("active");
    }
    areaButton.classList.remove("active");
    measurement.clear();
  }

  loadView();

  // The loadView() function to define the view for the widgets and div
  function loadView() {
    activeView.set({
      container: "viewDiv",
    });
    // Add the appropriate measurement UI to the bottom-right when activated
    activeView.ui.add(measurement, "bottom-right");
    // Add the legend to the bottom left
    // activeView.ui.add(legend, "bottom-left");
    // Set the views for the widgets
    measurement.view = activeView;
  }



  /*******************************************************************************
   * Start Zoom Previous and Zoom Next buttons
   *******************************************************************************
   * The solution presented here to add these 2 zoom buttons is based on work by RobertScheitlin__GISP.
   * See his answer to this question:
   * https://community.esri.com/t5/arcgis-javascript-maps-sdk-questions/does-the-class-quot-esri-toolbars-navigation-quot
   * Changes to the original RobertScheitlin__GISP solution: removed dojo and replaced watchUtils with reactiveUtils (to upgrade to 4.25)
   *******************************************************************************/

  reactiveUtils.when(
    () => view.stationary === true,
    () => {
      if (view.extent) {
        oldExtent = view.extent;
      }
      extentChangeHandler(view.extent);
    }
  );

  function createZoomPrevZoomNextBtns() {
    const zoomPrevNextBtnsDiv = document.createElement("div");
    zoomPrevNextBtnsDiv.innerHTML = `
       <div id="zoomPrevNextBtns" class="esri-component esri-zoom">
         <div id="zoomPrevBtn" class="esri-widget--button esri-widget esri-disabled" role="button">
               <span title="Previous extent" id="zoomPrev" class="esri-icon esri-icon-left-arrow"></span>
             </div>
         <div id="zoomNextBtn" class="esri-widget--button esri-widget esri-disabled" role="button">
               <span title="Next extent" id="zoomNext" class="esri-icon esri-icon-right-arrow"></span>
             </div>
           </div>`;
    document.body.appendChild(zoomPrevNextBtnsDiv);
  }

  let l_zoomPrevBtn = document.getElementById("zoomPrevBtn");
  l_zoomPrevBtn.addEventListener("click", zoomPreviousExtent);

  let l_zoomNextBtn = document.getElementById("zoomNextBtn");
  l_zoomNextBtn.addEventListener("click", zoomNextExtent);

  function zoomNextExtent() {
    _nextExtent = true;
    _extentHistoryIndx++;
    if (_extentHistoryIndx > _extentHistory.length - 1) {
      // this might happen if the user clicks the zoomNext button too often too fast
      _extentHistoryIndx = _extentHistory.length - 1;
    }
    view.goTo(_extentHistory[_extentHistoryIndx].currentExtent);
  }

  function zoomPreviousExtent() {
    if (_extentHistory[_extentHistoryIndx].preExtent) {
      _prevExtent = true;
      view.goTo(_extentHistory[_extentHistoryIndx].preExtent);
      _extentHistoryIndx--;
    }
  }

  function extentChangeHandler(evt) {
    if (_prevExtent || _nextExtent) {
      _currentExtent = evt;
    } else {
      _preExtent = _currentExtent;
      _currentExtent = evt;
      _extentHistory.push({
        preExtent: _preExtent,
        currentExtent: _currentExtent,
      });
      _extentHistoryIndx = _extentHistory.length - 1;
    }
    _prevExtent = _nextExtent = false;
    extentHistoryChange();
  }

  function extentHistoryChange() {
    if (_extentHistory.length === 0 || _extentHistoryIndx === 0) {
      l_zoomPrevBtn.classList.add("esri-disabled");
    } else {
      l_zoomPrevBtn.classList.remove("esri-disabled");
    }
    if (
      _extentHistory.length === 0 ||
      _extentHistoryIndx === _extentHistory.length - 1
    ) {
      l_zoomNextBtn.classList.add("esri-disabled");
    } else {
      l_zoomNextBtn.classList.remove("esri-disabled");
    }
  }
  /////////////////////////////////////////////////////////////


  document
    .getElementById("save_session_btn")
    .addEventListener("click", function (event) {
      const input = document.getElementById("user-input");
      const fileName = input.value.trim();

      if (!fileName) {
        alert("Please enter a valid file name.");
        return;
      }

      var thelayers = [];
      map.layers.items.map((layer) => {
        if (
          (layer.url || layer.source) &&
          !layer.title.includes("Districts w StateOutline")
        ) {
          thelayers.push(layer);
        }
      });

      const mapInfo = {
        basemap: map.basemap.id,
        extent: view.extent.toJSON(),
        layers: thelayers.map((layer) => {
          renderer = null;

          if (layer.renderer) {
            renderer = layer.renderer.toJSON(); // Serialize the renderer if available
          } else {
            // Default renderer for layers without a renderer
            renderer = {
              type: "simple",
              symbol: {
                type: "simple-fill", // Applies to polygons; adjust for other geometry types
                color: [227, 139, 79, 0.8],
                outline: {
                  color: [255, 255, 255],
                  width: 1,
                },
              },
            };
          }

          // Handle complex renderer fallback
          if (
            layer.type === "feature" &&
            layer.source &&
            (!renderer || typeof renderer.type === "undefined")
          ) {
            renderer = {
              type: "unique-value",
              field: "defaultField",
              uniqueValueInfos: [
                {
                  value: "default",
                  symbol: {
                    type: "simple-fill",
                    color: "blue",
                  },
                },
              ],
            };
          }
          console.log(layer.fields);

          function isLayerIdAppended(url) {
            // Regular expression to match a numeric layer ID at the end of the URL
            const layerIdRegex = /\/\d+$/;
            return layerIdRegex.test(url);
          }
          var fullUrl = "";
          // Check the layer's URL
          if (isLayerIdAppended(layer.url)) {
            fullUrl = layer.url;
            console.log("Layer ID is appended to the URL:", featureLayer.url);
          } else {
            const layerUrl = layer.url;
            const layerId = layer.layerId; // Get the layer ID from the service
            fullUrl = `${layerUrl}/${layerId}`;
          }

          return {
            id: layer.id,
            title: layer.title,
            objectIdField: layer.objectIdField,
            type: layer.type,
            fields: layer.fields,
            geometryType: layer.geometryType,
            url: fullUrl || null,
            source: layer.source || null,
            renderer: layer.renderer,
          };
        }),
        images: graphicsLayer.graphics.items
          .filter((graphic) => graphic.symbol.type === "picture-marker")
          .map((graphic) => ({
            url: graphic.symbol.url,
            geometry: graphic.geometry.toJSON(),
          })),
        text: graphicsLayer.graphics.items
          .filter((graphic) => graphic.symbol.type === "text")
          .map((graphic) => ({
            text: graphic.symbol.text,
            geometry: graphic.geometry.toJSON(),
          })),
      };

      // Convert map info to JSON
      const jsonBlob = new Blob([JSON.stringify(mapInfo, null, 2)], {
        type: "application/json",
      });

      // Create a download link
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(jsonBlob);
      downloadLink.download = `${fileName}.json`;
      downloadLink.click();
    });

  document;
  document
    .getElementById("restore_session")
    .addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const mapInfo = JSON.parse(e.target.result);

          // Restore basemap
          map.basemap = mapInfo.basemap;

          // Restore extent
          const extent = Extent.fromJSON(mapInfo.extent);
          view.extent = extent;

          // Restore layers
          map.removeAll();

          mapInfo.layers.forEach((layerInfo) => {
            if (layerInfo.type === "feature") {
              if (layerInfo.url) {
                // const layer = new FeatureLayer(layerInfo.url);
                // layer.load().then(() => {
                //   // console.log(fl.fields)
                //   renderer = rendererJsonUtils.fromJSON(layerInfo.renderer);
                //   if (renderer) {
                //     layer.renderer = renderer;
                //   }
                //   const popupTemplate = layer.createPopupTemplate();
                //   layer.popupTemplate = popupTemplate;
                //   // var layerid = "table_icon" + index;
                //   // document.getElementById(layerid).style.display = "block";
                //   //console.log(fl)
                //   view.map.add(layer);

                //  let fullURL= layerInfo.url + "/" +layerInfo.layerId
                //  console.log(fullURL)
                const checkboxes = document.querySelectorAll(
                  'input[type="checkbox"]'
                );

                for (let index = 0; index < checkboxes.length; index++) {
                  const checkbox = checkboxes[index];
                  // console.log(checkbox.value);
                  if (checkbox.value === layerInfo.url) {
                    checkbox.checked = true;

                    addFeatureLayerToMap(layerInfo);
                    break; // Exit the loop when the condition is met
                  }
                }

                // for (let i = 0; i < layers_config.layers.length; i++) {
                //   console.log(layers_config.layers[i].url)

                // }

                //  });
                //map.add(layer);
              } else {
                console.log(layerInfo);

                const source = layerInfo.source.map((graphic) => ({
                  geometry: {
                    type: layerInfo.geometryType, // Preserve the type property
                    ...graphic.geometry, // Include other geometry properties
                  },
                  attributes: { ...graphic.attributes },
                }));
                console.log(source.geometry);

                var polylineSymbol = {
                  type: "simple-line", // autocasts as SimpleLineSymbol()
                  color: [255, 0, 0],
                  width: 4,
                };

                const symbol = new SimpleFillSymbol({
                  style: "none",
                  outline: {
                    color: "#FF0000",
                    width: 3,
                  },
                });

                const polygonSymbol = {
                  type: "simple-fill",
                  color: [255, 0, 0, 0.8], // Orange, opacity 80%
                  outline: {
                    color: [0, 0, 0],
                    width: 4,
                  },
                };

                var rendererPt = new SimpleRenderer({ symbol: pointSymbol });
                var rendererLine = new SimpleRenderer({
                  symbol: polylineSymbol,
                });
                var rendererPolygon = new SimpleRenderer({
                  symbol: polygonSymbol,
                });
                var therenderer = null;
                if (layerInfo.geometryType === "point") {
                  therenderer = rendererPt;
                } else if (layerInfo.geometryType === "polygon") {
                  therenderer = rendererPolygon;
                } else if (layerInfo.geometryType === "polyline") {
                  therenderer = rendererLine;
                }

                console.log(layerInfo.source);

                const validFields = layerInfo.fields
                  .filter((field) => field.name.toLowerCase() !== "shape") // Remove Shape if invalid
                  .map((field) => ({
                    name: field.name,
                    alias: field.alias,
                    type: mapFieldType(field.type), // Map legacy types to valid ones
                  }));

                // Add Shape back explicitly as geometry
                validFields.push({
                  name: "Shape",
                  alias: "Shape",
                  type: "geometry",
                });

                // function mapFieldType(type) {
                //   const typeMap = {
                //     esriFieldTypeOID: "oid",
                //     esriFieldTypeString: "string",
                //     esriFieldTypeInteger: "integer",
                //     esriFieldTypeSmallInteger: "small-integer",
                //     esriFieldTypeDouble: "double",
                //     esriFieldTypeDate: "date",
                //     esriFieldTypeGUID: "guid",
                //     esriFieldTypeGlobalID: "global-id",
                //   };
                //   return typeMap[type] || type; // Fallback to original type if no mapping
                // }

                // Create the FeatureLayer
                const layer = new FeatureLayer({
                  id: layerInfo.id,
                  title: layerInfo.title,
                  objectIdField: layerInfo.objectIdField,
                  fields: validFields,
                  geometryType: layerInfo.geometryType,
                  spatialReference: { wkid: 102100 }, // Match the spatial reference
                  source: source,
                  renderer: therenderer,
                });
                view.map.add(layer);
              }
            } else if (layerInfo.type === "graphics") {
              // For restoring graphics layer data
              // graphicsLayer.graphics.removeAll();
            }
          });
        };
        reader.readAsText(file);
      }

      function convertSymbol(esriSymbol) {
        if (esriSymbol.type === "esriSFS") {
          return {
            type: "simple-fill",
            color: esriSymbol.color,
            outline: {
              type: "simple-line",
              color: esriSymbol.outline.color,
              width: esriSymbol.outline.width,
            },
          };
        }
        if (esriSymbol.type === "esriSLS") {
          return {
            type: "simple-line",
            color: esriSymbol.color,
            width: esriSymbol.width,
          };
        }
        return esriSymbol; // Return as is if no conversion is needed
      }
    });

  //adjust map left padding when left shell panel appears
  async function updateLeftPaddingAndWait(view, leftPadding) {
    // Update only the left padding, keeping the other padding values unchanged
    view.padding = {
      ...view.padding, // Spread operator to retain current padding values
      left: leftPadding,
    };

    // Wait until the view finishes updating
    await new Promise((resolve) => {
      const handle = view.watch("updating", (isUpdating) => {
        if (!isUpdating) {
          handle.remove(); // Stop watching once updating is complete
          resolve();
        }
      });
    });

    console.log("MapView refresh complete after left padding update!");
  }

  async function main(view, leftPadding) {
    await updateLeftPaddingAndWait(view, leftPadding);
    // console.log("Left padding updated:", leftPadding);
  }

function close_widgets() {  
    document.getElementById("add_layers_panel").style.display = "none";
    document.getElementById("add_data_panel").style.display = "none";
    document.getElementById("query_attrs_panel").style.display = "none";
    document.getElementById("query_geom_panel").style.display = "none";
    document.getElementById("session_panel").style.display = "none";
    document.getElementById("measurement_panel").style.display = "none";
    document.getElementById("sketch_panel").style.display = "none";
    document.getElementById("elevation_panel").style.display = "none";
    // document.getElementById("legend_panel").style.display = "none";
    document.getElementById("layerlist_panel").style.display = "none";
    document.getElementById("sketch_info").style.display = "none";


    view.popup.visible = true;
    shellPanel.collapsed = true;
    main(view, 49);
    full_table();
    clearFilter("no");
    clearMeasurements();

    selectedcomboboxquery_geom = null;

    // basemapGallery.visible = false;
    //legend.visible = false;
    // if (elevationProfile) {
    //   elevationProfile.visible = false;
    // }

    //layerList.visible = false;
    if (mapClickEvent) {
      mapClickEvent.remove();
    }
    
    // document.getElementById("print_box").style.display = "none";
  }

  
});
