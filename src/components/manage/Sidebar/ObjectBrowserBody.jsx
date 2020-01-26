import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { Input, Segment } from 'semantic-ui-react';
import { join } from 'lodash';
import { searchContent } from '@plone/volto/actions';
import { Icon } from '@plone/volto/components';
import { doesNodeContainClick } from 'semantic-ui-react/dist/commonjs/lib';

import { settings } from '~/config';
import backSVG from '@plone/volto/icons/back.svg';
import pageSVG from '@plone/volto/icons/page.svg';
import folderSVG from '@plone/volto/icons/folder.svg';
import clearSVG from '@plone/volto/icons/clear.svg';
import searchSVG from '@plone/volto/icons/zoom.svg';
import linkSVG from '@plone/volto/icons/link.svg';
import imageSVG from '@plone/volto/icons/image.svg';

import ObjectBrowserNav from './ObjectBrowserNav';

const messages = defineMessages({
  SearchInputPlaceholder: {
    id: 'Search content',
    defaultMessage: 'Search content',
  },
});

function getParentURL(url) {
  return (
    `${join(url.split('/').slice(0, -1), '/')}`.replace(settings.apiPath, '') ||
    '/'
  );
}

/**
 * ObjectBrowserBody container class.
 * @class ObjectBrowserBody
 * @extends Component
 */
class ObjectBrowserBody extends Component {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {
    block: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    data: PropTypes.objectOf(PropTypes.any).isRequired,
    searchSubrequests: PropTypes.objectOf(PropTypes.any).isRequired,
    searchContent: PropTypes.func.isRequired,
    closeObjectBrowser: PropTypes.func.isRequired,
    onChangeBlock: PropTypes.func.isRequired,
    onSelectItem: PropTypes.func,
    dataName: PropTypes.string,
  };

  /**
   * Default properties.
   * @property {Object} defaultProps Default properties.
   * @static
   */
  static defaultProps = {
    image: '',
    href: '',
    onSelectItem: null,
    dataName: null,
  };

  /**
   * Constructor
   * @method constructor
   * @param {Object} props Component properties
   * @constructs WysiwygEditor
   */
  constructor(props) {
    super(props);
    this.state = {
      currentFolder: this.props.data.url
        ? getParentURL(this.props.data.url)
        : '/',
      currentImageFolder: this.props.data.url
        ? getParentURL(this.props.data.url)
        : '/',
      currentLinkFolder: this.props.data.href
        ? getParentURL(this.props.data.href)
        : '/',
      parentFolder: '',
      selectedImage: this.props.data.url
        ? this.props.data.url.replace(settings.apiPath, '')
        : '',
      selectedHref: this.props.data.href
        ? this.props.data.href.replace(settings.apiPath, '')
        : '',
      showSearchInput: false,
    };
  }

  /**
   * Component did mount
   * @method componentDidMount
   * @returns {undefined}
   */
  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside, false);
    this.initialSearch(this.props.mode);
  }

  /**
   * Component will receive props
   * @method componentWillUnmount
   * @returns {undefined}
   */
  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside, false);
  }

  initialSearch = mode => {
    const currentSelected =
      mode === 'image' ? this.state.selectedImage : this.state.selectedHref;
    if (currentSelected) {
      this.props.searchContent(
        getParentURL(currentSelected),
        {
          'path.depth': 1,
          sort_on: 'getObjPositionInParent',
          metadata_fields: '_all',
        },
        `${this.props.block}-${mode}`,
      );
    } else {
      this.props.searchContent(
        '/',
        {
          'path.depth': 1,
          sort_on: 'getObjPositionInParent',
          metadata_fields: '_all',
        },
        `${this.props.block}-${mode}`,
      );
    }
  };

  getIcon = icon => {
    switch (icon) {
      case 'Folder':
        return <Icon name={folderSVG} size="24px" />;
      case 'Document':
        return <Icon name={pageSVG} size="24px" />;
      case 'Image':
        return <Icon name={imageSVG} size="24px" />;
      case 'File':
        return <Icon name={pageSVG} size="24px" />;
      default:
        return <Icon name={pageSVG} size="24px" />;
    }
  };

  handleClickOutside = e => {
    if (
      this.objectBrowser &&
      doesNodeContainClick(this.objectBrowser.current, e)
    )
      return;
    this.props.closeObjectBrowser();
  };

  objectBrowser = React.createRef();

  navigateTo = id => {
    this.props.searchContent(
      id,
      {
        'path.depth': 1,
        sort_on: 'getObjPositionInParent',
        metadata_fields: '_all',
      },
      `${this.props.block}-${this.props.mode}`,
    );
    const parent = `${join(id.split('/').slice(0, -1), '/')}` || '/';
    this.setState(() => ({
      parentFolder: parent,
      currentFolder: id || '/',
    }));
  };

  toggleSearchInput = () =>
    this.setState(prevState => ({
      showSearchInput: !prevState.showSearchInput,
    }));

  onSearch = e => {
    const text = e.target.value;
    text.length > 2
      ? this.props.searchContent(
          '/',
          {
            SearchableText: `${text}*`,
            metadata_fields: '_all',
          },
          `${this.props.block}-${this.props.mode}`,
        )
      : this.props.searchContent(
          '/',
          {
            'path.depth': 1,
            sort_on: 'getObjPositionInParent',
            metadata_fields: '_all',
          },
          `${this.props.block}-${this.props.mode}`,
        );
  };

  onSelectItem = (url, title) => {
    const { block, data, mode, dataName, onChangeBlock } = this.props;

    const updateState = mode => {
      switch (mode) {
        case 'image':
          this.setState({
            selectedImage: url,
            currentImageFolder: getParentURL(url),
          });
          break;
        case 'link':
          this.setState({
            selectedHref: url,
            currentLinkFolder: getParentURL(url),
          });
          break;
        default:
          break;
      }
    };

    if (dataName) {
      onChangeBlock(block, {
        ...data,
        [dataName]: url,
      });
    } else if (this.props.onSelectItem) {
      this.props.onSelectItem(url);
    } else if (mode === 'image') {
      onChangeBlock(block, {
        ...data,
        url: `${settings.apiPath}${url}`,
        alt: title,
      });
    } else if (mode === 'link') {
      onChangeBlock(block, {
        ...data,
        href: url,
      });
    }
    updateState(mode);
  };

  onChangeBlockData = (key, value) => {
    this.props.onChangeBlock(this.props.block, {
      ...this.props.data,
      [key]: value,
    });
  };

  handleClickOnItem = item => {
    if (this.props.mode === 'image') {
      if (item.is_folderish) {
        this.navigateTo(item['@id']);
      }
      if (settings.imageObjects.includes(item['@type'])) {
        this.onSelectItem(item['@id'], item.title);
      }
    } else {
      this.onSelectItem(item['@id'], item.title);
    }
  };

  handleDoubleClickOnItem = item => {
    if (this.props.mode === 'image') {
      if (item.is_folderish) {
        this.navigateTo(item['@id']);
      }
      if (settings.imageObjects.includes(item['@type'])) {
        this.onSelectItem(item['@id'], item.title);
        this.props.closeObjectBrowser();
      }
    } else {
      this.onSelectItem(item['@id'], item.title);
      this.props.closeObjectBrowser();
    }
  };

  /**
   * Render method.
   * @method render
   * @returns {string} Markup for the component.
   */
  render() {
    return ReactDOM.createPortal(
      <aside
        role="presentation"
        onClick={e => {
          e.stopPropagation();
        }}
        ref={this.objectBrowser}
        key="objectbrowsercontainerkey"
        className="sidebar-container"
      >
        <Segment.Group raised>
          <header className="header pulled">
            <div className="vertical divider" />
            {this.state.currentFolder === '/' ? (
              <>
                {this.props.mode === 'image' ? (
                  <Icon name={folderSVG} size="24px" />
                ) : (
                  <Icon name={linkSVG} size="24px" />
                )}
              </>
            ) : (
              <Icon
                name={backSVG}
                size="24px"
                onClick={() => this.navigateTo(this.state.parentFolder)}
              />
            )}
            {this.state.showSearchInput ? (
              <form>
                <Input
                  className="search"
                  onChange={this.onSearch}
                  placeholder={this.props.intl.formatMessage(
                    messages.SearchInputPlaceholder,
                  )}
                />
              </form>
            ) : this.props.mode === 'image' ? (
              <h2>
                <FormattedMessage
                  id="Choose Image"
                  defaultMessage="Choose Image"
                />
              </h2>
            ) : (
              <h2>
                <FormattedMessage
                  id="Choose Target"
                  defaultMessage="Choose Target"
                />
              </h2>
            )}

            <button onClick={this.toggleSearchInput}>
              <Icon name={searchSVG} size="24px" />
            </button>
            <button onClick={this.props.closeObjectBrowser}>
              <Icon name={clearSVG} size="24px" />
            </button>
          </header>
          <Segment secondary>{this.state.currentFolder}</Segment>

          <ObjectBrowserNav
            currentSearchResults={
              this.props.searchSubrequests[
                `${this.props.block}-${this.props.mode}`
              ]
            }
            selected={
              this.props.mode === 'image'
                ? this.state.selectedImage
                : this.state.selectedHref
            }
            getIcon={this.getIcon}
            handleClickOnItem={this.handleClickOnItem}
            handleDoubleClickOnItem={this.handleDoubleClickOnItem}
            mode={this.props.mode}
            navigateTo={this.navigateTo}
          />
        </Segment.Group>
      </aside>,
      document.body,
    );
  }
}

export default compose(
  injectIntl,
  connect(
    state => ({
      searchSubrequests: state.search.subrequests,
    }),
    { searchContent },
  ),
)(ObjectBrowserBody);
