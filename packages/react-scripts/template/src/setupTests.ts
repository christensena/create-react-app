window.matchMedia = window.matchMedia || function() {
    return {
        matches : false,
        // tslint:disable-next-line:no-empty
        addListener : function() {},
        // tslint:disable-next-line:no-empty
        removeListener: function() {}
    };
};