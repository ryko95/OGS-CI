var wms_layers = [];


        var lyr_OSMStandard_0 = new ol.layer.Tile({
            'title': 'OpenStreetMap (OSM France)',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
                attributions: '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a> · Tiles: <a href="https://www.openstreetmap.fr/" target="_blank">OpenStreetMap France</a>',
                urls: [
                    'https://a.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
                    'https://b.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
                    'https://c.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png'
                ],
                maxZoom: 20,
                crossOrigin: 'anonymous'
            })
        });
var format_REGIONSANITAIRE_1 = new ol.format.GeoJSON();
var features_REGIONSANITAIRE_1 = format_REGIONSANITAIRE_1.readFeatures(json_REGIONSANITAIRE_1, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_REGIONSANITAIRE_1 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_REGIONSANITAIRE_1.addFeatures(features_REGIONSANITAIRE_1);
var lyr_REGIONSANITAIRE_1 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_REGIONSANITAIRE_1, 
                style: style_REGIONSANITAIRE_1,
                popuplayertitle: 'REGION SANITAIRE',
                interactive: true,
                title: '<img src="styles/legend/REGIONSANITAIRE_1.png" /> REGION SANITAIRE'
            });
var format_LIEUDESUICIDE_2 = new ol.format.GeoJSON();
var features_LIEUDESUICIDE_2 = format_LIEUDESUICIDE_2.readFeatures(json_LIEUDESUICIDE_2, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_LIEUDESUICIDE_2 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_LIEUDESUICIDE_2.addFeatures(features_LIEUDESUICIDE_2);
var lyr_LIEUDESUICIDE_2 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_LIEUDESUICIDE_2, 
                style: style_LIEUDESUICIDE_2,
                popuplayertitle: 'LIEU DE SUICIDE',
                interactive: true,
                title: '<img src="styles/legend/LIEUDESUICIDE_2.png" /> LIEU DE SUICIDE'
            });
var format_SERVICESDESOINSPUBLICS_3 = new ol.format.GeoJSON();
var features_SERVICESDESOINSPUBLICS_3 = format_SERVICESDESOINSPUBLICS_3.readFeatures(json_SERVICESDESOINSPUBLICS_3, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_SERVICESDESOINSPUBLICS_3 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_SERVICESDESOINSPUBLICS_3.addFeatures(features_SERVICESDESOINSPUBLICS_3);
var lyr_SERVICESDESOINSPUBLICS_3 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_SERVICESDESOINSPUBLICS_3, 
                style: style_SERVICESDESOINSPUBLICS_3,
                popuplayertitle: 'SERVICES DE SOINS PUBLICS',
                interactive: true,
                title: '<img src="styles/legend/SERVICESDESOINSPUBLICS_3.png" /> SERVICES DE SOINS PUBLICS'
            });

lyr_OSMStandard_0.setVisible(true);lyr_REGIONSANITAIRE_1.setVisible(true);lyr_LIEUDESUICIDE_2.setVisible(true);lyr_SERVICESDESOINSPUBLICS_3.setVisible(true);
var layersList = [lyr_OSMStandard_0,lyr_REGIONSANITAIRE_1,lyr_LIEUDESUICIDE_2,lyr_SERVICESDESOINSPUBLICS_3];
lyr_REGIONSANITAIRE_1.set('fieldAliases', {'REG_2012': 'REG_2012', ' ID_EVENEM': ' ID_EVENEM', ' DATE_EVEN': ' DATE_EVEN', ' DATE_EV_1': ' DATE_EV_1', ' DATE_DECE': ' DATE_DECE', ' DATE_PUBL': ' DATE_PUBL', ' ANNEE': ' ANNEE', ' LOCALITE': ' LOCALITE', ' Y_LATITUD': ' Y_LATITUD', ' X_LONGITU': ' X_LONGITU', ' REGION': ' REGION', ' REGION_1': ' REGION_1', ' DISTRICT': ' DISTRICT', ' TYPE_MILI': ' TYPE_MILI', ' TYPE_MILI_1': ' TYPE_MILI_1', ' TYPE_MILI_2': ' TYPE_MILI_2', ' TYPE_MILI_3': ' TYPE_MILI_3', ' CATEGORIE': ' CATEGORIE', ' CATEGORIE_1': ' CATEGORIE_1', ' CATEGORIE_2': ' CATEGORIE_2', 'METHODE': 'METHODE', 'METHODE_1': 'METHODE_1', ' NVE_PREUV': ' NVE_PREUV', 'NBRE CAS': 'NBRE CAS', 'NBRE CAS_1': 'NBRE CAS_1', 'NBRE CAS_2': 'NBRE CAS_2', 'TYPE SOURC': 'TYPE SOURC', 'HOMME': 'HOMME', 'FEMME': 'FEMME', 'NIV PREUVE': 'NIV PREUVE', 'URBAIN': 'URBAIN', 'RURAL': 'RURAL', 'CONFIRME': 'CONFIRME', 'RAPPORTE': 'RAPPORTE', ' PRESUME': ' PRESUME', });
lyr_LIEUDESUICIDE_2.set('fieldAliases', {'id_eveneme': 'id_eveneme', 'date_evene': 'date_evene', 'date_deces': 'date_deces', 'annee': 'annee', 'localite': 'localite', 'Y': 'Y', 'X': 'X', 'regions': 'regions', 'REGION': 'REGION', 'district': 'district', 'type_milie': 'type_milie', 'categorie_': 'categorie_', 'sexe': 'sexe', 'age': 'age', 'categori_1': 'categori_1', 'statut_pro': 'statut_pro', 'contexte_p': 'contexte_p', 'methode_ge': 'methode_ge', 'statut_con': 'statut_con', 'niveau_pre': 'niveau_pre', 'nombre_cas': 'nombre_cas', 'source_pri': 'source_pri', 'source_typ': 'source_typ', 'date_publi': 'date_publi', 'url_source': 'url_source', 'source_sec': 'source_sec', });
lyr_SERVICESDESOINSPUBLICS_3.set('fieldAliases', {'ET_ID': 'ET_ID', 'NOM': 'NOM', 'IDES_SFS': 'IDES_SFS', 'PSYCHIATRE': 'PSYCHIATRE', });
lyr_REGIONSANITAIRE_1.set('fieldImages', {'REG_2012': 'TextEdit', ' ID_EVENEM': 'TextEdit', ' DATE_EVEN': 'TextEdit', ' DATE_EV_1': 'TextEdit', ' DATE_DECE': 'TextEdit', ' DATE_PUBL': 'TextEdit', ' ANNEE': 'TextEdit', ' LOCALITE': 'TextEdit', ' Y_LATITUD': 'TextEdit', ' X_LONGITU': 'TextEdit', ' REGION': 'TextEdit', ' REGION_1': 'TextEdit', ' DISTRICT': 'TextEdit', ' TYPE_MILI': 'TextEdit', ' TYPE_MILI_1': 'TextEdit', ' TYPE_MILI_2': 'TextEdit', ' TYPE_MILI_3': 'TextEdit', ' CATEGORIE': 'TextEdit', ' CATEGORIE_1': 'TextEdit', ' CATEGORIE_2': 'TextEdit', 'METHODE': 'TextEdit', 'METHODE_1': 'TextEdit', ' NVE_PREUV': 'TextEdit', 'NBRE CAS': 'CheckBox', 'NBRE CAS_1': 'TextEdit', 'NBRE CAS_2': 'TextEdit', 'TYPE SOURC': 'TextEdit', 'HOMME': 'TextEdit', 'FEMME': 'TextEdit', 'NIV PREUVE': 'TextEdit', 'URBAIN': 'TextEdit', 'RURAL': 'TextEdit', 'CONFIRME': 'TextEdit', 'RAPPORTE': 'TextEdit', ' PRESUME': 'TextEdit', });
lyr_LIEUDESUICIDE_2.set('fieldImages', {'id_eveneme': 'TextEdit', 'date_evene': 'TextEdit', 'date_deces': 'TextEdit', 'annee': 'TextEdit', 'localite': 'TextEdit', 'Y': 'TextEdit', 'X': 'TextEdit', 'regions': 'TextEdit', 'REGION': 'TextEdit', 'district': 'TextEdit', 'type_milie': 'TextEdit', 'categorie_': 'TextEdit', 'sexe': 'TextEdit', 'age': 'TextEdit', 'categori_1': 'TextEdit', 'statut_pro': 'TextEdit', 'contexte_p': 'TextEdit', 'methode_ge': 'TextEdit', 'statut_con': 'TextEdit', 'niveau_pre': 'TextEdit', 'nombre_cas': 'CheckBox', 'source_pri': 'TextEdit', 'source_typ': 'TextEdit', 'date_publi': 'TextEdit', 'url_source': 'TextEdit', 'source_sec': 'TextEdit', });
lyr_SERVICESDESOINSPUBLICS_3.set('fieldImages', {'ET_ID': '', 'NOM': 'TextEdit', 'IDES_SFS': 'Range', 'PSYCHIATRE': 'Range', });
lyr_REGIONSANITAIRE_1.set('fieldLabels', {'REG_2012': 'no label', ' ID_EVENEM': 'no label', ' DATE_EVEN': 'no label', ' DATE_EV_1': 'no label', ' DATE_DECE': 'no label', ' DATE_PUBL': 'no label', ' ANNEE': 'no label', ' LOCALITE': 'no label', ' Y_LATITUD': 'no label', ' X_LONGITU': 'no label', ' REGION': 'no label', ' REGION_1': 'no label', ' DISTRICT': 'no label', ' TYPE_MILI': 'no label', ' TYPE_MILI_1': 'no label', ' TYPE_MILI_2': 'no label', ' TYPE_MILI_3': 'no label', ' CATEGORIE': 'no label', ' CATEGORIE_1': 'no label', ' CATEGORIE_2': 'no label', 'METHODE': 'no label', 'METHODE_1': 'no label', ' NVE_PREUV': 'no label', 'NBRE CAS': 'no label', 'NBRE CAS_1': 'no label', 'NBRE CAS_2': 'no label', 'TYPE SOURC': 'no label', 'HOMME': 'no label', 'FEMME': 'no label', 'NIV PREUVE': 'no label', 'URBAIN': 'no label', 'RURAL': 'no label', 'CONFIRME': 'no label', 'RAPPORTE': 'no label', ' PRESUME': 'no label', });
lyr_LIEUDESUICIDE_2.set('fieldLabels', {'id_eveneme': 'no label', 'date_evene': 'no label', 'date_deces': 'no label', 'annee': 'no label', 'localite': 'no label', 'Y': 'no label', 'X': 'no label', 'regions': 'no label', 'REGION': 'no label', 'district': 'no label', 'type_milie': 'no label', 'categorie_': 'no label', 'sexe': 'no label', 'age': 'no label', 'categori_1': 'no label', 'statut_pro': 'no label', 'contexte_p': 'no label', 'methode_ge': 'no label', 'statut_con': 'no label', 'niveau_pre': 'no label', 'nombre_cas': 'no label', 'source_pri': 'no label', 'source_typ': 'no label', 'date_publi': 'no label', 'url_source': 'no label', 'source_sec': 'no label', });
lyr_SERVICESDESOINSPUBLICS_3.set('fieldLabels', {'ET_ID': 'no label', 'NOM': 'no label', 'IDES_SFS': 'no label', 'PSYCHIATRE': 'no label', });
lyr_SERVICESDESOINSPUBLICS_3.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});