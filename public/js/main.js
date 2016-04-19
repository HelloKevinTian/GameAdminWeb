function addTab(name, url) {
    $('#tt').tabs('add', {
        title: name,
        content: '<iframe frameborder="0" height=100% width=100% name="' + name + '" src="' + url + '"></iframe>',
        closable: true
    });

}