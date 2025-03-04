import React , {useState , useEffect , useRef} from 'react';
import PropTypes from 'prop-types';
import BannerSlider from './BannerSlider';
import { useNavigate } from 'react-router-dom';

// images-export
import PopServicesSlider from './PopServicesSlider';
import RechargesBlocks from './RechargesBlocks';
import ExploreCities from './ExploreCities';
import AdSlider from './AdSlider';

import PgHostel from '../../assets/images/recharge-logos/pg-hostel.svg';
import Hospital from '../../assets/images/categories-logos/hospital.svg';
import HomeDecor from '../../assets/images/categories-logos/home-decors.svg';
import HotelRoom from '../../assets/images/categories-logos/hotels.svg';
import Restaurants from '../../assets/images/categories-logos/restuarants.svg';
import Courier from '../../assets/images/categories-logos/courier.svg';
import Gym from '../../assets/images/categories-logos/gym.svg';
import Dental from '../../assets/images/categories-logos/dental.svg';
import FunctionHall from '../../assets/images/categories-logos/function-hall.svg';
import Packers from '../../assets/images/categories-logos/packers-movers.svg';
import WeddingHall from '../../assets/images/categories-logos/wedding-halls.svg';
import PetShop from '../../assets/images/categories-logos/petshop.svg';
import LanSvg from '../../assets/images/language-svg.svg';
import Logo from '../../assets/images/favicon-svg.svg';
import LoginModal from './LoginModal';
import BrowseAllCategories from './BrowseAllCategories';
import Select from 'react-select';
import Modal from 'react-modal';
import LoadingImage from '../../assets/images/loader-test.gif';
import './Home.scss';
import AppsSlider from './AppsSlider';
import { useAuth } from '../../utils/AuthContext';
import axios from 'axios';
import { config } from '../../env-services';
import Lottie from 'lottie-react';
import SearchLoader from '../../assets/images/animated-logos/search-loader.json'
import useSearchStore from '../../Store/useSearchStore';




const Home = () => {

  const navigate = useNavigate();

  const { authToken } = useAuth();

  const { filters , setFilter , removeFilter , fetchSearchResults } = useSearchStore();


  const [headerBar , setHeaderBar] = useState(false);
  const [language , setLanguage] = useState(false);
  const [languageSelector , setLanguageSelector] = useState('EN');
  const [categorySelect , setCategorySelect] = useState();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allCategoryOpen , setAllCategoryOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [searchSuggest , setSearchSuggest] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [citySelect ,  setCitySelect] = useState(null)
  const [cityOptions , setCityOptions] = useState([]);
  const [userCity, setUserCity] = useState(null);


  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const debounceTimeout = useRef(null);
  
  

  const placeholders = [
    'Search for anything?',
    'Search for restaurants',
    'Search for people',
    'Search for products'
  ];





  useEffect(() => {
    getCities()
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }


    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300); // Adjust debounce time as needed




    setTimeout(() => {
      openModal()
    }, 2000)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
        // console.log(response?.data?.address)
        const cityName = response.data.address.city || response.data.address.town;
        
        setUserCity(cityName); // Save the city name
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
    }, 2000);

    // getUserLocation();

    return () => {clearInterval(interval) , clearTimeout(debounceTimeout.current)};

  }, [query]);


  const getCities = async() => {
    await axios.get(config.api + `locations/states/678daa989c4467c6aa4eeb89/cities`)
    .then((response) => {
      if (response?.data?.data) {
        const formattedCities = response.data.data.map(item => ({
          value: item._id,
          label: item.name,
        }));
        setCityOptions(formattedCities);

        // Check if user's city exists in the list
        const matchedCity = formattedCities.find(city => city.label.toLowerCase() === userCity?.toLowerCase());
        if (matchedCity) {
          setCitySelect(matchedCity);
        }
      }
    });
  }

  const fetchSuggestions = async (searchTerm) => {
    try {
      await axios.get(
        `${config.api}search/suggestions?q=${searchTerm}`
      ).then(resposne => {
        setSuggestions(resposne?.data?.data?.suggestions);
        setSearchSuggest(true);
      }).catch((err) => {
        console.log(err)
      })
    } catch (error) {
      // console.error("Error fetching search suggestions:", error);
    }
  };


  const handleSuggestionClick = async (data) => {
    let filterKey = "searchKey"; 

    if (data?.type === "category") {
      filterKey = "categoryId";
    } else if (data?.type === "business") {
      filterKey = "businessId";
    } else if (data?.type) {
      filterKey = data?.type; 
    }

    setFilter(filterKey, data?.id);
    navigate("/search");
  };


useEffect(() => {
  if (userCity) {
    getCities();
  }
}, [userCity]);


  const openLoaderModal = () => {
    setModalIsOpen(true);
  }

  const closeLoaderModal = () => {
    setModalIsOpen(false)
  }


  const getCityFromCoordinates = async (lat, lon) => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.state;
      return city;
    } catch (error) {
      console.error("Error fetching city from coordinates:", error);
      return null;
    }
  };

  const handleSearchNav = () => {
    openLoaderModal();
    setTimeout(() => {
      navigate('/search')
    } , 2000)
  }

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openBrowseCategory = () => setAllCategoryOpen(true)

  const closeBrowseCategory = () =>  setAllCategoryOpen(false)


  

  const handleLanguageSelect = () => {
    setLanguage(!language)
  }


  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', 
    });
  };


  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 600) {
      setHeaderBar(true)
    }
    if(window.pageYOffset <= 500) {
      setHeaderBar(false)
    }
  });


  const allCategories = [
    {
      icon: PgHostel,
      title: 'Hostels & PG’s'
    },
    {
      icon: Hospital,
      title: 'Hospitals'
    },
    {
      icon: HomeDecor,
      title: 'Home Decors'
    },
    {
      icon: HotelRoom,
      title: 'Hotels'
    },
    {
      icon: Restaurants,
      title: 'Restaurants'
    },
    {
      icon: Courier,
      title: 'Courier Service'
    },
    {
      icon: Gym,
      title: 'GYM’s'
    },
    {
      icon: Dental,
      title: 'Dental'
    },
    {
      icon: FunctionHall,
      title: 'Function Halls'
    },
    {
      icon: Packers,
      title: 'Packers & Movers'
    },
    {
      icon: WeddingHall,
      title: 'Wedding Halls'
    },
    {
      icon: PetShop,
      title: 'Pet Shops'
    },
  ]




  
  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '600px',
      borderRadius: 20
    },
  };



  return (
    <div className="Home relative">
      <Modal
          isOpen={modalIsOpen}
          style={customStyles}
          contentLabel="Example Modal"
          
      >
        {/* <img src={LoadingImage} className='w-full h-full max-w-[500px] max-h-[500px] mx-auto' alt="" /> */}
          <div className="nodata-found-section flex justify-center flex-col items-center px-8 py-8 w-full">
            <Lottie animationData={SearchLoader} style={{ width: 350}}/>
          </div>
        {/* <button type="button" className='text-Black font-medium text-lg' onClick={closeLoaderModal}>Close MODAL</button> */}
      </Modal>
      <div className="main-home-section">
        {authToken ? 
            null : 
            <div className="home-login-main-top-modal-section">
             <LoginModal isOpen={isModalOpen} closeModal={closeModal} />
           </div>
        }
        <div className="inner-home-section">
          <section className="home-section-1 relative">
            <div className="inner-home-section-1 bg-BlockBlack">
              <div className="container">
                <div className={`top-main-search-section-home duration-500 z-[9999] ${headerBar ? 'fixed top-0 w-full bg-BlockBlack left-0 py-6 px-[15px]' : ' pb-16'}`}>
                    <div className="inner-search-relative-section-home relative">
                    <div className="search-grid-section-home-main">
                      <div className="search-grid-container-main">
                        <div className="grid grid-cols-10 justify-center gap-x-6 top-search-section-grid-parent">
                          <div className="col-span-3">
                            <div className={`location-setting-section grid items-center grid-cols-6 gap-x-4 w-full bg-white rounded-full px-5 h-70p ${headerBar ? 'shadow-xl' : ''}`}>
                              <div className="icon-section">
                                <i className='ri-map-pin-fill text-2xl text-Secondary'></i>
                              </div>
                              <div className="country-selection col-span-5">
                                <Select options={cityOptions} 
                                  placeholder='Choose Location'
                                  styles={{
                                      control: (baseStyles, state) => ({
                                        ...baseStyles,
                                        borderRadius: 10,
                                        paddingLeft: 0,
                                        paddingTop: 4,
                                        paddingBottom: 4,
                                        borderWidth: 0,
                                        outlineWidth: 0,
                                        borderColor: '#fff',
                                        outlineColor: '#fff',
                                        fontSize: 18,
                                        minWidth: '100%',
                                        // borderColor: state.isFocused ? 'grey' : 'red',
                                        boxShadow: state.isFocused ? 'none' : 'none',
                                        
                                      }),
                                    }}
                                  value={citySelect}
                                  onChange={(option) => setCitySelect(option)}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`col-span-7 ${headerBar ? 'shadow-xl' : ''}`}>
                            <div className={`big-search-section duration-500 bg-white p-[6px] h-70p relative ${searchSuggest ? 'rounded-t-30p rounded-b-0' : 'rounded-40p'}`}>
                                <div className="grid grid-cols-10 h-full">
                                  <div className="col-span-8">
                                    <div className="main-search-input-section h-full relative">
                                      <input type="text" onFocus={() => setSearchSuggest(true)} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholders[currentIndex]} 
                                      name="" id=""  className='text-xl text-Black h-full max-h-[58px] font-medium pl-9 pr-5 w-full bg-transparent focus:outline-none focus:border-none outline-none border-none'/>
                                      {searchSuggest && ( <button type="button"  onClick={() => {setQuery("") ; setSearchSuggest(false) ; setSuggestions([])}}  className='absolute top-1/2 right-10 text-xl search-clear-icon'><i className="ri-close-large-fill text-red-400"></i></button> )}
                                    </div>
                                  </div>
                                  <div className="col-span-2">
                                    <div className="cate-loc-search-btn h-full w-full">
                                      <button type="button"  onClick={() => fetchSuggestions(query)} className='bg-Primary duration-300 hover:scale-95 rounded-full h-full max-h-[58px] flex items-center w-full justify-center shadow-customized'>
                                        <p className='text-white  font-medium'>Search</p>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className={`absolute-searched-results-section bg-white rounded-b-30p absolute w-full h-[300px] overflow-hidden overflow-y-auto border-t border-BorderColor left-0 z-[9999999] duration-500 ${searchSuggest ? 'opacity-100 visible translate-y-[5px]' : 'invisible opacity-0 translate-y-6'} ${headerBar ? 'border-[2px] border-t-[1px] border-BorderColor' : ''}`}>
                                    <div className="inner-searched-results-section px-4 py-4 flex flex-col gap-y-4">
                                      {searchSuggest && suggestions.length > 0 ? suggestions.map((items , index) => {
                                        return (
                                          <button type="button" onClick={() => handleSuggestionClick(items)} className='text-left flex items-center gap-x-4 w-full bg-LightBlue px-4 py-3 rounded-lg' key={index}>
                                            <div className="left-goto-icon w-10 h-10 flex items-center justify-center bg-white rounded-full">
                                              <i class="bi bi-arrow-up-right"></i>
                                            </div>
                                            <div className="right-text-below-text text-left">
                                              <p className='text-lg font-semibold'>{items?.suggestion}</p>
                                              <div className="sub-text">
                                                <p className='opacity-60'>Category</p>
                                              </div>
                                            </div>
                                          </button>
                                        )
                                      }) : 
                                      <button type="button" className='text-left flex items-center gap-x-4 w-full bg-LightGrayBg px-4 py-3 rounded-lg'>
                                        <div className="right-text-below-text text-left">
                                          <p className='text-lg font-semibold'>No Data Found</p>
                                        </div>
                                      </button>}
                                    </div>
                                </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    </div>
                </div>
                <section className="home-section-5-mobile-view ">
                  <div className="inner-home-section-5">
                    <div className="">
                        <div className="main-categories-home-sec-5">
                            <div className="top-heading-part-categories flex flex-wrap justify-between gap-x-10 items-center mb-10">
                                <div className="left-categories-heading-home">
                                    <h2 className='text-30 text-white font-medium'>Explore Wide Range Categories</h2>
                                </div>
                                <div className="explore-all-cates-button">
                                    <button type="button" onClick={openBrowseCategory} className='explore-cities-button-prev'>
                                      <p className='text-Secondary text-lg font-medium'>Browse All</p>
                                    </button>
                                </div>
                            </div>
                            <div className="bottom-all-categories-section">
                                <div className="grid grid-cols-4 gap-x-10p gap-y-60p home-categories-grid-section">
                                  {allCategories.map((items , index) => {
                                    return (
                                      <button type='button' key={index} className="single-recharge-component-home-sec-2 group flex flex-col justify-center items-center gap-2">
                                          <div className="top-image-blk  w-40p h-40p flex items-center justify-center">
                                              <img src={items.icon} className='duration-500 w-full group-hover:scale-125' alt="" />
                                          </div>
                                          <div className="bottom-text-blk">
                                              <p className='text-white text-center text-xs'>{items.title}</p>
                                          </div>
                                      </button>
                                    )
                                  })}
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
                </section>
                <div className="top-slider-search-section">
                  <div className="grid grid-cols-2 gap-x-16 items-center top-slider-grid-sec">
                    <div className="left-home-section-1">
                      <div className="heading-section-1 flex flex-col gap-5">
                        <h1 className='text-white font-semibold text-50'>Find Everything <br /> You Need, Every Day!</h1>
                        <p className='text-white text-xl'>Looking for deals, services, or a place to <br /> buy and sell? We’ve got you covered.</p>
                      </div>
                      {/* <div className={`home-search-section-1 mt-14 `}>
                        <div className="inner-seacrh-section grid grid-cols-12 bg-white rounded-full p-3 pl-5 justify-between">
                            <div className="col-span-5">
                                <div className="category-section flex items-center gap-2">
                                  <div className="left-category-logo-search w-[10%]">
                                    <i className="ri-map-pin-line text-Primary text-2xl"></i>
                                  </div>
                                  <div className="right-category-dropdown-section w-[80%]">
                                      <div>
                                          <Select options={cityOptions} 
                                              placeholder='Choose Location'
                                              styles={{
                                                  control: (baseStyles, state) => ({
                                                    ...baseStyles,
                                                    borderRadius: 10,
                                                    paddingLeft: 0,
                                                    paddingTop: 4,
                                                    paddingBottom: 4,
                                                    borderWidth: 0,
                                                    outlineWidth: 0,
                                                    borderColor: '#fff',
                                                    outlineColor: '#fff',
                                                    fontSize: 14,
                                                    // borderColor: state.isFocused ? 'grey' : 'red',
                                                    boxShadow: state.isFocused ? 'none' : 'none',
                                                  }),
                                                }}
                                              value={citySelect}
                                              onChange={(option) => setCitySelect(option)}
                                          />
                                      </div>
                                  </div>
                                </div>
                            </div>
                            <div className="col-span-5">
                                <div className="category-section flex items-center gap-2">
                                  <div className="left-category-logo-search w-[10%]">
                                    <i className="ri-file-list-3-line text-Primary text-2xl"></i>
                                  </div>
                                  <div className="right-category-dropdown-section w-[80%]">
                                      <div>
                                          <Select options={categoryOptions} 
                                              placeholder='Choose Category'
                                              styles={{
                                                  control: (baseStyles, state) => ({
                                                    ...baseStyles,
                                                    borderRadius: 10,
                                                    paddingLeft: 0,
                                                    paddingTop: 4,
                                                    paddingBottom: 4,
                                                    borderWidth: 0,
                                                    outlineWidth: 0,
                                                    borderColor: '#fff',
                                                    outlineColor: '#fff',
                                                     fontSize: 14,
                                                    boxShadow: state.isFocused ? 'none' : 'none',

                                                  }),
                                                }}
                                              value={categorySelect}
                                              onChange={(option) => setCategorySelect(option)}
                                          />
                                      </div>
                                  </div>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <div className="cate-loc-search-btn h-full w-full">
                                  <button type="button"  onClick={handleSearchNav} className='bg-Primary duration-300 hover:scale-95 rounded-full h-full flex items-center w-full justify-center shadow-customized'>
                                    <p className='text-white  font-medium'>Search</p>
                                  </button>
                                </div>
                            </div>
                        </div>
                      </div> */}
                    </div>
                    <div className="right-home-section-1">
                      <BannerSlider/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bottom-apps-home-section-1 mt-16">
                  <AppsSlider/>
                </div>
            </div>
            <div className="inner-home-section-2">
              <div className="container">
                <PopServicesSlider/>
              </div>
            </div>
          </section>
          <section className="home-section-2">
            <div className="inner-home-section-2">
              <RechargesBlocks/>
            </div>              
          </section>
          <section className="home-section-3">
            <div className="inner-home-section-3">
              <div className="container">
                  <ExploreCities/>
              </div>
            </div>
          </section>
          <section className="home-section-4">
            <div className="inner-home-section-4">
              <AdSlider/> 
            </div>
          </section>
          <section className="home-section-5">
            <div className="inner-home-section-5">
              <div className="container">
                  <div className="main-categories-home-sec-5">
                      <div className="top-heading-part-categories flex justify-between gap-10 items-center mb-10">
                          <div className="left-categories-heading-home">
                              <h2 className='text-30 text-white font-medium'>Explore Wide Range Categories</h2>
                          </div>
                          <div className="explore-all-cates-button">
                              <button type="button" onClick={openBrowseCategory} className='explore-cities-button-prev shadow-customized bg-white px-5 py-2 rounded-full flex items-center gap-10p border-LightBlack border-opacity-40 border'>
                                <i className="ri-menu-3-line text-Primary text-2xl"></i>
                                <p className='text-Primary text-lg font-medium'>Browse All</p>
                              </button>
                          </div>
                      </div>
                      <div className="bottom-all-categories-section">
                          <div className="grid grid-cols-6 gap-x-90p gap-y-60p home-categories-grid-section">
                            {allCategories.map((items , index) => {
                              return (
                                <button type='button' key={index} className="single-recharge-component-home-sec-2 group flex flex-col justify-center items-center gap-3">
                                    <div className="top-image-blk bg-white w-100p h-100p flex items-center justify-center p-5 rounded-[15px]">
                                        <img src={items.icon} className='duration-500 group-hover:scale-125' alt="" />
                                    </div>
                                    <div className="bottom-text-blk">
                                        <p className='text-white text-center text-medium'>{items.title}</p>
                                    </div>
                                </button>
                              )
                            })}
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <div className="browse-all-categories-fixed-section">
          <BrowseAllCategories isCategoryOpen={allCategoryOpen} closeCategory={closeBrowseCategory} />
      </div>
    </div>
  );
}

Home.propTypes = {};

Home.defaultProps = {};

export default Home;
