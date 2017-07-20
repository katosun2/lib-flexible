;(function(win, lib) {
	var doc = win.document;
	var docEl = doc.documentElement;
	var metaEl = doc.querySelector('meta[name="viewport"]');
	var flexibleEl = doc.querySelector('meta[name="flexible"]');
	var flexibleWidthEl = doc.querySelector('meta[name="flexible-width"]');
	var dpr = 0;
	var scale = 0;
	var maxWidth = 540;
	var tid;
	var flexible = lib.flexible || (lib.flexible = {});

	if (metaEl) {
		console.warn('将根据已有的meta标签来设置缩放比例');
		var match = metaEl.getAttribute('content').match(/initial\-scale=([\d\.]+)/);
		if (match) {
			scale = parseFloat(match[1]);
			dpr = parseInt(1 / scale);
		}
	} else if (flexibleEl) {
		var content = flexibleEl.getAttribute('content');
		if (content) {
			var initialDpr = content.match(/initial\-dpr=([\d\.]+)/);
			var maximumDpr = content.match(/maximum\-dpr=([\d\.]+)/);
			if (initialDpr) {
				dpr = parseFloat(initialDpr[1]);
				scale = parseFloat((1 / dpr).toFixed(2));    
			}
			if (maximumDpr) {
				dpr = parseFloat(maximumDpr[1]);
				scale = parseFloat((1 / dpr).toFixed(2));    
			}
		}
	}

	if (flexibleWidthEl) {
		maxWidth = parseInt(flexibleWidthEl.getAttribute('content'), 10);
		if(isNaN(maxWidth)){
			maxWidth = 540;
		}
	}

	if (!dpr && !scale) {
		var isAndroid = win.navigator.appVersion.match(/android/gi);
		var isIPhone = win.navigator.appVersion.match(/iphone/gi);
		var devicePixelRatio = win.devicePixelRatio;
		if (isIPhone) {
			// iOS下，对于2和3的屏，用2倍的方案，其余的用1倍方案
			if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {                
				dpr = 3;
			} else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)){
				dpr = 2;
			} else {
				dpr = 1;
			}
		} else {
			// 其他设备下，仍旧使用1倍的方案
			dpr = 1;
		}
		scale = 1 / dpr;
	}

	docEl.setAttribute('data-dpr', dpr);
	if (!metaEl) {
		metaEl = doc.createElement('meta');
		metaEl.setAttribute('name', 'viewport');
		metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
		if (docEl.firstElementChild) {
			docEl.firstElementChild.appendChild(metaEl);
		} else {
			var wrap = doc.createElement('div');
			wrap.appendChild(metaEl);
			doc.write(wrap.innerHTML);
		}
	}

	function refreshRem(){
		var width = docEl.getBoundingClientRect().width;

		// maxWidth，默认540其实是个经验值，或者最大值, 这个经验是怎么得出来的呢？
		// 目前主流手机最大的css像素尺寸，是540（比如devicePixelRatio为2，分辨率是1080x1920的手机）
		// 所以用了这个经验值。这样可以让在ipad横屏这种情况下浏览无线页面，
		// 不至于因为拉伸适配后体验太差。
		if (width / dpr > maxWidth && maxWidth > -1) {
			width = maxWidth * dpr;
		}
		var rem = width / 10;
		docEl.style.fontSize = rem + 'px';
		flexible.rem = win.rem = rem;
	}

	win.addEventListener('resize', function() {
		clearTimeout(tid);
		tid = setTimeout(refreshRem, 300);
	}, false);
	win.addEventListener('pageshow', function(e) {
		if (e.persisted) {
			clearTimeout(tid);
			tid = setTimeout(refreshRem, 300);
		}
	}, false);

	// body上设置12 * dpr的font-size值
	// 为了重置页面中的字体默认值
	// 不然没有设置font-size的元素会继承html上的font-size，变得很大
	if (doc.readyState === 'complete') {
		doc.body.style.fontSize = 12 * dpr + 'px';
	} else {
		doc.addEventListener('DOMContentLoaded', function(e) {
			doc.body.style.fontSize = 12 * dpr + 'px';
		}, false);
	}


	refreshRem();

	flexible.dpr = win.dpr = dpr;
	flexible.refreshRem = refreshRem;
	flexible.rem2px = function(d) {
		var val = parseFloat(d) * this.rem;
		if (typeof d === 'string' && d.match(/rem$/)) {
			val += 'px';
		}
		return val;
	}
	flexible.px2rem = function(d) {
		var val = parseFloat(d) / this.rem;
		if (typeof d === 'string' && d.match(/px$/)) {
			val += 'rem';
		}
		return val;
	}

})(window, window['lib'] || (window['lib'] = {}));
