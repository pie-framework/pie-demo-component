import '../../stencil.core';
declare enum ViewState {
    LOADING = 0,
    READY = 1,
    ERROR = 2
}
declare type PieController = {
    model: (config: Object, session: Object, env: Object) => Promise<Object>;
    score: (config: Object, session: Object, env: Object) => Promise<Object>;
};
interface PieElement extends HTMLElement {
    model: Object;
    session: Object;
}
export declare class PieDemo {
    /**
     * The PIE npm package to demo. e.g. `@pie-element/multiple-choice`
     */
    pie: string;
    /**
     * Tells the component if it needs to load the elements or not
     */
    load: boolean;
    /**
     * Include an editor in the view
     */
    editor: boolean;
    /**
     * Include an item preview in the view
     */
    preview: boolean;
    /**
     * Include control panel for adjusting player settings.
     */
    playerControls: boolean;
    /**
     * The model for the pie.
     */
    model: Object;
    configModel: Object;
    state: ViewState;
    package: string;
    pieName: string;
    pieController: PieController;
    pieElement: PieElement;
    pieElementModel: Object;
    configElement: PieElement;
    collapsed: string;
    studSettVisible: boolean;
    env: Object;
    session: Object;
    /**
     * Some functionality
     */
    loadPies: Function;
    collapsePanel(name: any): void;
    toggleStudentSettings(): void;
    watchPie(newPie: any): void;
    updateModel(newModel: any): Promise<void>;
    watchConfigModel(newModel: any): Promise<void>;
    updatePieModelFromController(model: any, session: any, env: any): Promise<void>;
    watchPieElementModel(newModel: any): void;
    componentWillLoad(): void;
    componentWillUpdate(): void;
    wachConfigElement(newEl: PieElement): void;
    setMode(mode: any): void;
    customCheckBox({ label, checked, value }: {
        label: any;
        checked: any;
        value: any;
    }): JSX.Element;
    renderHeaderTitleInfo({ title, description, options }: {
        title: any;
        description: any;
        options?: any;
    }): JSX.Element;
    renderAuthoringHeader(): JSX.Element;
    renderStudentHeader(): JSX.Element;
    renderControlBar(): JSX.Element;
    renderCollapsedPanel(title: any): JSX.Element;
    renderAuthoringHolder: () => JSX.Element;
    renderStudentHolder: () => JSX.Element;
    render(): JSX.Element;
}
export {};
