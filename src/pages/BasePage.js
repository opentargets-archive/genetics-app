import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { Page, NavBar, Footer } from 'ot-ui';

const BasePage = ({ children }) => {
    const header = (
        <Switch>
            <Route exact path="/" component={null} />
            <Route path="/*" render={() => <NavBar name="Genetics" />} />
        </Switch>
    );
    const footer = (
        <Switch>
            <Route exact path="/" component={null} />
            <Route path="/*" render={() => <Footer style={{ bottom: 0 }} />} />
        </Switch>
    );
    return (
        <Page header={header} footer={footer}>
            {children}
        </Page>
    );
};

export default BasePage;
