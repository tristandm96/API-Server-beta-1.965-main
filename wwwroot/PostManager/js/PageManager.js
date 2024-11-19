class PageManager {
    constructor(scrollPanelId, itemsPanelId, itemLayout, getItemsCallBack, pageUICallback, form = false) {
        this.scrollPanel = $(`#${scrollPanelId}`);
        this.itemsPanel = $(`#${itemsPanelId}`);
        this.itemLayout = itemLayout;
        this.currentPage = { limit: -1, offset: -1 };
        this.resizeTimer = null;
        this.resizeEndTriggerDelai = 300;
        this.getItems = getItemsCallBack;
        this.pageUi = pageUICallback;
        this.Inform = form;
        this.searchString = "";
        this.categories = [];
        this.selectedCategory = "";
        this.installViewportReziseEvent();
        this.reset();
    }
    reset() {
        this.resetScrollPosition();
        this.update(false);
    }
    installViewportReziseEvent() {
        if (!this.Inform) {
            let instance = this;
            $(window).on('resize', function (e) {
                clearTimeout(instance.resizeTimer);
                instance.resizeTimer = setTimeout(() => { instance.update(false); }, instance.resizeEndTriggerDelai);
            });
        }
    }
    setCurrentPageLimit() {
        let nbColumns = Math.trunc(this.scrollPanel.innerWidth() / this.itemLayout.width);
        if (nbColumns < 1) nbColumns = 1;
        let nbRows = Math.round(this.scrollPanel.innerHeight() / this.itemLayout.height);
        this.currentPage.limit = nbRows * nbColumns + nbColumns /* make sure to always have a content overflow */;
    }
    currentPageToQueryString(append = false) {
        this.setCurrentPageLimit();
        let limit = this.currentPage.limit;
        let offset = this.currentPage.offset;
        if (!append) {
            limit = limit * (offset + 1);
            offset = 0;
        }
        if (this.searchString !== "") {
            if (this.selectedCategory !== "") {
                return `?limit=${limit}&offset=${offset}&sort=Creation,desc&keywords=${this.searchString}&Category=${this.selectedCategory}`
            }
            return `?limit=${limit}&offset=${offset}&sort=Creation,desc&keywords=${this.searchString}`;
        }
        if (this.selectedCategory !== "") {
            return `?limit=${limit}&offset=${offset}&sort=Creation,desc&Category=${this.selectedCategory}`
        }
        return `?limit=${limit}&offset=${offset}&sort=Creation,desc`;
    }
    scrollPosition() {
        return this.scrollPanel.scrollTop();
    }
    storeScrollPosition() {
        this.scrollPanel.off();
        this.previousScrollPosition = this.scrollPosition();
    }
    resetScrollPosition() {
        this.currentPage.offset = 0;
        this.scrollPanel.off();
        this.scrollPanel.scrollTop(0);
    }
    restoreScrollPosition() {
        this.scrollPanel.off();
        this.scrollPanel.scrollTop(this.previousScrollPosition);
    }
    async update(append = true) {
        this.storeScrollPosition();
        if (!append) this.itemsPanel.empty();
        //this.pageUi();
        let endOfData = await this.getItems(this.currentPageToQueryString(append));
        this.restoreScrollPosition();

        let instance = this;
        this.scrollPanel.scroll(function () {
            if ( !endOfData && instance.scrollPanel.scrollTop() + instance.scrollPanel.outerHeight() >= instance.itemsPanel.outerHeight()) {
                instance.scrollPanel.off();
                instance.currentPage.offset++;
                instance.update(true);
            }
        });
    }
    inform() {
        this.Inform ? this.Inform = false : this.Inform = true;
    }
}