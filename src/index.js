import Marker from './marker';
import Map from './map';
import {Panel} from './panels';
import Popup from './popup';
import mapboxgl from 'mapbox-gl';
import * as three from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {inject} from '@vercel/analytics';
import './css/loaders.css';
import './css/swiper.css';
import './css/mini-singapore-3d.css';

// Initialize Vercel Analytics
inject();

const THREE = Object.assign({GLTFLoader}, three);

export default {
    mapboxgl,
    Marker,
    Map,
    Panel,
    Popup,
    THREE
};
