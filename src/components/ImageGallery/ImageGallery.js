import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { getImages } from 'srvices/fetchImages';
import { ImageGalleryItem } from 'components/ImageGalleryItem/ImageGalleryItem';
import { Button } from 'components/Button/Button';
import { Modal } from 'components/Modal/Modal';
import { Error } from 'components/Error/Error';
import { Loader } from 'components/Loader/Loader';

const STATUS = {
  IDLE: 'idle',
  PENDING: 'pending',
  REJECTED: 'rejected',
  RESOLVED: 'resolved',
};

export const ImageGallery = ({ searchResult }) => {
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [pageNumber, setPageNumber] = useState(1);
  const [loadMore, setLoadMore] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [largeImageUrl, setLargeImageUrl] = useState('');
  const [tags, setTags] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [query, setQuery] = useState(searchResult);

  const reset = () => {
    setImages([]);
    setPageNumber(1);
  };

  useEffect(() => {
    if (!searchResult) {
      return;
    }
    reset();
    setQuery(searchResult);
  }, [searchResult]);

  useEffect(() => {
    if (!query) {
      return;
    }
    getImages(query, pageNumber)
      .then(e => {
        setImages(prevDef => [...prevDef, ...e]);
        if (e.length === 0) {
          setStatus(STATUS.REJECTED);
        } else {
          setStatus(STATUS.RESOLVED);
        }
        setLoadMore(12 - e.length);
        setIsLoadingMore(false);
      })
      .catch(error => console.log(error));
  }, [query, pageNumber]);

  useEffect(() => {
    if (!searchResult) {
      return;
    }
    setStatus(STATUS.PENDING);
    setImages([]);
  }, [searchResult]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setPageNumber(prevDef => prevDef + 1);
  };

  const getLargeUrl = (imageUrl, tagNames) => {
    setLargeImageUrl(imageUrl);
    setTags(tagNames);
    toggleModal();
  };

  const toggleModal = () => {
    setShowModal(prevDef => !prevDef);
  };

  if (status === STATUS.RESOLVED) {
    return (
      <ImageGalleryItem images={images} loadLargeUrl={getLargeUrl}>
        {loadMore === 0 &&
          (isLoadingMore ? <Loader /> : <Button onLoadMore={handleLoadMore} />)}
        {showModal && (
          <Modal onClose={toggleModal} imgUrl={largeImageUrl} tags={tags} />
        )}
      </ImageGalleryItem>
    );
  }

  if (status === STATUS.REJECTED) {
    return <Error inputValue={searchResult} />;
  }

  if (status === STATUS.PENDING) {
    return <Loader />;
  }
};

ImageGallery.propTypes = {
  searchResult: PropTypes.string.isRequired,
};
