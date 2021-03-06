import React from 'react';
import ReactSwipeableViews from 'react-swipeable-views';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import ExtendedVideoPlayer from '../../../components/extended_video_player';
import { defineMessages, injectIntl } from 'react-intl';
import IconButton from '../../../components/icon_button';
import ImmutablePureComponent from 'react-immutable-pure-component';
import ImageLoader from './image_loader';

const messages = defineMessages({
  close: { id: 'lightbox.close', defaultMessage: 'Close' },
});

@injectIntl
export default class MediaModal extends ImmutablePureComponent {

  static propTypes = {
    media: ImmutablePropTypes.list.isRequired,
    index: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  state = {
    index: null,
  };

  handleSwipe = (index) => {
    this.setState({ index: (index) % this.props.media.size });
  }

  handleNextClick = () => {
    this.setState({ index: (this.getIndex() + 1) % this.props.media.size });
  }

  handlePrevClick = () => {
    this.setState({ index: (this.props.media.size + this.getIndex() - 1) % this.props.media.size });
  }

  handleKeyUp = (e) => {
    switch(e.key) {
    case 'ArrowLeft':
      this.handlePrevClick();
      break;
    case 'ArrowRight':
      this.handleNextClick();
      break;
    }
  }

  componentDidMount () {
    window.addEventListener('keyup', this.handleKeyUp, false);
  }

  componentWillUnmount () {
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  getIndex () {
    return this.state.index !== null ? this.state.index : this.props.index;
  }

  render () {
    const { media, intl, onClose } = this.props;

    const index = this.getIndex();
    const attachment = media.get(index);
    const url = attachment.get('url');

    let leftNav, rightNav, content;

    leftNav = rightNav = content = '';

    if (media.size > 1) {
      leftNav  = <div role='button' tabIndex='0' className='modal-container__nav modal-container__nav--left' onClick={this.handlePrevClick}><i className='fa fa-fw fa-chevron-left' /></div>;
      rightNav = <div role='button' tabIndex='0' className='modal-container__nav  modal-container__nav--right' onClick={this.handleNextClick}><i className='fa fa-fw fa-chevron-right' /></div>;
    }

    if (attachment.get('type') === 'image') {
      content = media.map((image) => {
        const width  = image.getIn(['meta', 'original', 'width']) || null;
        const height = image.getIn(['meta', 'original', 'height']) || null;

        return <ImageLoader previewSrc={image.get('preview_url')} src={image.get('url')} width={width} height={height} key={image.get('preview_url')} />;
      }).toArray();
    } else if (attachment.get('type') === 'gifv') {
      content = <ExtendedVideoPlayer src={url} muted controls={false} />;
    }

    return (
      <div className='modal-root__modal media-modal'>
        {leftNav}

        <div className='media-modal__content'>
          <IconButton className='media-modal__close' title={intl.formatMessage(messages.close)} icon='times' onClick={onClose} size={16} />
          <ReactSwipeableViews onChangeIndex={this.handleSwipe} index={index} animateHeight>
            {content}
          </ReactSwipeableViews>
        </div>

        {rightNav}
      </div>
    );
  }

}
