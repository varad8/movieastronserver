const axios = require("axios");
const Movie = require("../models/Movie");
const Category = require("../models/Category");
const dotenv = require("dotenv");
const Series = require("../models/Series");
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL;
const fs = require("fs");
const path = require("path");

dotenv.config();
const TMDB_TOKEN = process.env.TMDB_TOKEN;

// Load genres from a JSON file once during initialization
const genresFilePath = path.join(__dirname, "genre.json");
let genres = [];

// Map category to language
let languageMap = {
  bollywood: "hi", // Hindi
  hollywood: "en", // English
  tollywood: "te", // Telugu
  kollywood: "ta", // Tamil
  mollywood: "ml", // Malayalam
  sandalwood: "kn", // Kannada
  japanese: "ja", //Japanese
  korean: "ko", //Korean
  anime: "16",
};

const loadGenres = () => {
  try {
    const data = fs.readFileSync(genresFilePath, "utf8");
    genres = JSON.parse(data).genres || [];
  } catch (error) {
    console.error("Error loading genres:", error.message);
    genres = [];
  }
};

loadGenres(); // Initialize genres

// Utility function to map genre IDs to names
const getGenreNames = (genreIds) => {
  return genreIds.map((id) => {
    const genre = genres.find((genre) => genre.id === id);
    return genre ? genre.name : "Unknown";
  });
};

const getAllMovieBanner = async (req, res) => {
  try {
    // Fetch the most recent movies from the database, ordered by creation date
    const recentMovies = await Movie.find().sort({ createdAt: -1 }).limit(5); // Fetching 5 most recent movies

    // Fetch details for each movie from TMDb
    const movieDetailsPromises = recentMovies.map(async (movie) => {
      const tmdbUrl = `${TMDB_BASE_URL}movie/${movie.movieId}?language=en-US`;

      const tmdbResponse = await fetch(tmdbUrl, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${TMDB_TOKEN}`, // Use Bearer token for authentication
        },
      });

      if (!tmdbResponse.ok) {
        throw new Error(
          `Failed to fetch TMDb data for movieId ${movie.movieId}`
        );
      }

      const tmdbData = await tmdbResponse.json();

      // Return a combination of database data and TMDb data
      return {
        movieId: movie.movieId,
        title: tmdbData.title,
        backdropPath: tmdbData.backdrop_path,
        posterPath: tmdbData.poster_path,
        overview: tmdbData.overview,
        releaseDate: tmdbData.release_date,
        rating: tmdbData.vote_average,
        genres: getGenreNames(tmdbData.genres.map((genre) => genre.id)),
        downloadLinks: movie.downloadLinks,
      };
    });

    // Wait for all the promises to resolve
    const moviesWithDetails = await Promise.all(movieDetailsPromises);

    // Return the data to the frontend
    res.json(moviesWithDetails);
  } catch (error) {
    console.error("Error in getAllMovieBanner:", error.message);
    res.status(500).json({ message: "Failed to fetch the latest movies." });
  }
};

const getAllMoviesByCategory = async (req, res) => {
  const { categorytitle } = req.params;

  try {
    // Check if the category is anime
    const isAnime = categorytitle.toLowerCase() === "anime";

    // Validate the category
    if (!isAnime && !languageMap[categorytitle.toLowerCase()]) {
      return res.status(400).json({ message: "Invalid category title." });
    }

    // Fetch all movie IDs from the database
    const allMovies = await Movie.find();

    // Fetch movie details from TMDb for each movie ID
    const movieDetailsPromises = allMovies.map(async (movie) => {
      const tmdbUrl = `${TMDB_BASE_URL}movie/${movie.movieId}?language=en`;

      const tmdbResponse = await fetch(tmdbUrl, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${TMDB_TOKEN}`,
        },
      });

      if (!tmdbResponse.ok) {
        throw new Error(
          `Failed to fetch TMDb data for movieId ${movie.movieId}`
        );
      }

      const tmdbData = await tmdbResponse.json();

      // Check for Anime category and validate genre ID 16
      if (isAnime && !tmdbData.genres.some((genre) => genre.id === 16)) {
        return null; // Exclude movies that are not in the Anime genre
      }

      // Exclude movies with "Animation" genre when the category is not "anime"
      if (
        !isAnime &&
        tmdbData.genres.some((genre) => genre.name === "Animation")
      ) {
        return null;
      }

      // For non-anime categories, validate original language
      if (
        !isAnime &&
        tmdbData.original_language !== languageMap[categorytitle.toLowerCase()]
      ) {
        return null;
      }

      return {
        movieId: movie.movieId,
        title: tmdbData.title,
        backdropPath: tmdbData.backdrop_path,
        posterPath: tmdbData.poster_path,
        overview: tmdbData.overview,
        releaseDate: tmdbData.release_date,
        rating: tmdbData.vote_average,
        genres: tmdbData.genres.map((genre) => genre.name),
        downloadLinks: movie.downloadLinks, // From the DB
      };
    });

    // Filter out null results and wait for all promises to resolve
    const moviesWithDetails = (await Promise.all(movieDetailsPromises)).filter(
      (movie) => movie !== null
    );

    // Return the movies with details to the frontend
    res.json(moviesWithDetails);
  } catch (error) {
    console.error("Error fetching movies by category:", error.message);
    res.status(500).json({ message: "Failed to fetch movies by category." });
  }
};

// const getMovieById = async (req, res) => {
//   try {
//     const { id: movieId } = req.params;

//     // Fetch movie from database
//     const movie = await Movie.findOne({ movieId });
//     if (!movie) {
//       return res.status(404).json({ message: "Movie not found in database." });
//     }

//     // Fetch movie details from TMDb
//     const tmdbUrl = `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=credits,images,videos`;

//     const tmdbResponse = await fetch(tmdbUrl, {
//       method: "GET",
//       headers: {
//         accept: "application/json",
//         Authorization: `Bearer ${TMDB_TOKEN}`,
//       },
//     });

//     if (!tmdbResponse.ok) {
//       const errorData = await tmdbResponse.json();
//       console.error(
//         `TMDb API Error: ${tmdbResponse.status} - ${errorData.status_message}`
//       );
//       return res
//         .status(tmdbResponse.status)
//         .json({ message: `TMDb API Error: ${errorData.status_message}` });
//     }

//     const tmdbData = await tmdbResponse.json();

//     // Helper functions for transformations
//     const transformCast = (cast) =>
//       cast.map((member) => ({
//         id: member.id,
//         name: member.name,
//         character: member.character,
//         profilePath: member.profile_path,
//       }));

//     const transformCrew = (crew) =>
//       crew.map((member) => ({
//         id: member.id,
//         name: member.name,
//         job: member.job,
//         profilePath: member.profile_path,
//       }));

//     const transformImages = (images) =>
//       images.map((image) => ({
//         filePath: image.file_path,
//         width: image.width,
//         height: image.height,
//       }));

//     const findTrailer = (videos) =>
//       videos?.find(
//         (video) => video.type === "Trailer" && video.site === "YouTube"
//       )?.key;

//     // Transform TMDb data
//     const cast = transformCast(tmdbData.credits.cast);
//     const crew = transformCrew(tmdbData.credits.crew);
//     const backdrops = transformImages(tmdbData.images.backdrops);
//     const posters = transformImages(tmdbData.images.posters);
//     const trailerKey = findTrailer(tmdbData.videos.results);
//     const trailerUrl = trailerKey
//       ? `https://www.youtube.com/watch?v=${trailerKey}`
//       : null;

//     const transformedDownloadLinks = movie.downloadLinks.map((link) => ({
//       quality: link.quality,
//       size: link.size,
//       link: link.link,
//     }));

//     // Combine media data under a 'media' object
//     const media = {
//       backdrops,
//       posters,
//       trailer: trailerUrl,
//     };

//     // Combined response with the media object
//     const response = {
//       ...movie.toObject(),
//       downloadLinks: transformedDownloadLinks,
//       tmdbDetails: {
//         title: tmdbData.title,
//         overview: tmdbData.overview,
//         releaseDate: tmdbData.release_date,
//         runtime: tmdbData.runtime,
//         genres: tmdbData.genres.map((genre) => genre.name),
//         cast,
//         crew,
//         popularity: tmdbData.popularity,
//         vote_average: tmdbData.vote_average,
//         vote_count: tmdbData.vote_count,
//         tagline: tmdbData.tagline,
//         poster_path: tmdbData.poster_path,
//         backdrop_path: tmdbData.backdrop_path,
//       },
//       media, // Include the media object here
//     };

//     res.status(200).json(response);
//   } catch (error) {
//     console.error("Internal Server Error:", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

const getMovieById = async (req, res) => {
  try {
    const { id: movieId } = req.params;

    // Fetch movie from the database
    const movie = await Movie.findOne({ movieId });

    // Fetch movie details from TMDb
    const tmdbUrl = `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=credits,images,videos`;

    const tmdbResponse = await fetch(tmdbUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${TMDB_TOKEN}`,
      },
    });

    if (!tmdbResponse.ok) {
      const errorData = await tmdbResponse.json();
      console.error(
        `TMDb API Error: ${tmdbResponse.status} - ${errorData.status_message}`
      );
      return res
        .status(tmdbResponse.status)
        .json({ message: `TMDb API Error: ${errorData.status_message}` });
    }

    const tmdbData = await tmdbResponse.json();

    // Helper functions for transformations
    const transformCast = (cast) =>
      cast.map((member) => ({
        id: member.id,
        name: member.name,
        character: member.character,
        profilePath: member.profile_path,
      }));

    const transformCrew = (crew) =>
      crew.map((member) => ({
        id: member.id,
        name: member.name,
        job: member.job,
        profilePath: member.profile_path,
      }));

    const transformImages = (images) =>
      images.map((image) => ({
        filePath: image.file_path,
        width: image.width,
        height: image.height,
      }));

    const findTrailer = (videos) =>
      videos?.find(
        (video) => video.type === "Trailer" && video.site === "YouTube"
      )?.key;

    const transformVideos = (videos) =>
      videos.map((video) => ({
        id: video.id,
        name: video.name,
        site: video.site,
        type: video.type,
        key: video.key,
      }));

    // Transform TMDb data
    const cast = transformCast(tmdbData.credits.cast);
    const crew = transformCrew(tmdbData.credits.crew);
    const backdrops = transformImages(tmdbData.images.backdrops);
    const posters = transformImages(tmdbData.images.posters);
    const trailerKey = findTrailer(tmdbData.videos.results);
    const trailerUrl = trailerKey
      ? `https://www.youtube.com/watch?v=${trailerKey}`
      : null;
    const videos = transformVideos(tmdbData.videos.results);

    // If movie is not found in DB, set downloadLinks to empty array
    const transformedDownloadLinks = movie
      ? movie.downloadLinks.map((link) => ({
          quality: link.quality,
          size: link.size,
          link: link.link,
        }))
      : [];

    // Combine media data under a 'media' object
    const media = {
      backdrops,
      posters,
      trailer: trailerUrl,
      videos, // Include all videos here
    };

    // Combined response with the media object
    const response = {
      movieId: movieId,
      downloadLinks: transformedDownloadLinks, // Empty if not in DB
      tmdbDetails: {
        title: tmdbData.title,
        overview: tmdbData.overview,
        releaseDate: tmdbData.release_date,
        runtime: tmdbData.runtime,
        genres: tmdbData.genres.map((genre) => genre.name),
        cast,
        crew,
        popularity: tmdbData.popularity,
        vote_average: tmdbData.vote_average,
        vote_count: tmdbData.vote_count,
        tagline: tmdbData.tagline,
        poster_path: tmdbData.poster_path,
        backdrop_path: tmdbData.backdrop_path,
      },
      media, // Include the media object here
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Internal Server Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getTrendingMovies = async (req, res) => {
  try {
    const { dayweek } = req.params;
    console.log(req.params);

    // Function to fetch data from TMDb
    const fetchTmdbData = async (url) => {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${TMDB_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data from TMDb.");
      }

      return await response.json();
    };

    // Fetch all movies from the database
    const allMovies = await Movie.find({});

    // Fetch trending movies from TMDb
    const tmdbUrl = `${TMDB_BASE_URL}trending/movie/${dayweek}?language=en-US`;
    const tmdbData = await fetchTmdbData(tmdbUrl);

    // Function to get movie details (cast, crew, backdrops, etc.)
    const getMovieDetails = async (tmdbMovie) => {
      // Check if the movie exists in the database
      const movieInDb = allMovies.find(
        (movie) => movie.movieId === tmdbMovie.id
      );

      // Build the movie details structure with or without DB data
      const movieDetails = {
        movieId: tmdbMovie.id,
        title: tmdbMovie.title,
        posterPath: tmdbMovie.poster_path,
        backdropPath: tmdbMovie.backdrop_path,
        overview: tmdbMovie.overview,
        releaseDate: tmdbMovie.release_date,
        rating: tmdbMovie.vote_average,
        genres: getGenreNames(tmdbMovie.genre_ids),
        downloadLinks: [],
      };

      // If the movie exists in the database, add download links and additional details
      if (movieInDb) {
        movieDetails.downloadLinks = movieInDb.downloadLinks || [];

        // Fetch additional movie details from TMDb
        const movieDetailUrl = `${TMDB_BASE_URL}movie/${tmdbMovie.id}?append_to_response=credits,images,videos,release_dates`;
        const detailedMovieData = await fetchTmdbData(movieDetailUrl);
      }

      return movieDetails;
    };

    // Process each trending movie in parallel and fetch their details
    const trendingMovies = await Promise.all(
      tmdbData.results.map((tmdbMovie) => getMovieDetails(tmdbMovie))
    );

    // Return the combined movie data
    res.json(trendingMovies);
  } catch (error) {
    console.error("Error in getTrendingMovies:", error.message);
    res.status(500).json({ message: "Failed to fetch trending movies." });
  }
};

// Get Movie Count By Category
const getMoviesCountByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Find the category by name
    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Count the number of movies that match the category
    const count = await Movie.countDocuments({ category: categoryDoc._id });

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//Get Series Banner for homepage of series
const getAllSeriesBanner = async (req, res) => {
  try {
    // Define categories to fetch
    const categoriesToFetch = [
      "Netflix Series",
      "Amzon Original",
      "Hostar Special",
    ];
    const seriesPromises = categoriesToFetch.map(async (categoryName) => {
      const category = await Category.findOne({ name: categoryName });
      if (category) {
        const series = await Series.find({ category: category._id })
          .sort({ createdAt: -1 })
          .limit(5)
          .exec();
        return series.map((s) => ({
          title: s.title,
          plot: s.plot,
          year: s.year,
          rated: s.rated,
          released: s.released,
          runtime: s.runtime,
          genre: s.genre,
          language: s.language,
          country: s.country,
          poster: s.poster,
          imdbRating: s.imdbRating,
          imdbVotes: s.imdbVotes,
          imdbID: s.imdbID,
          category: category.name,
          totalSeasons: s.totalSeasons,
          _id: s._id,
        }));
      }
      return [];
    });

    // Wait for all promises to resolve
    const seriesResults = await Promise.all(seriesPromises);

    // Combine results into a single response
    const response = seriesResults.flat();

    // Send the response
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

// Get all series by category
const getAllSeriesByCategory = async (req, res) => {
  const { categorytitle } = req.params; // Extract category title from URL parameters
  const { genre, year, imdbRating } = req.query; // Extract filters from query parameters

  const query = {}; // Initialize query object

  // Add filters to query object if they exist
  if (genre) query.genre = genre;
  if (year) query.year = year;
  if (imdbRating) query.imdbRating = imdbRating;

  try {
    // Find the category by title
    const categoryDoc = await Category.findOne({ name: categorytitle });
    if (!categoryDoc) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Add the category filter to the query object
    query.category = categoryDoc._id;

    let series;
    if (Object.keys(req.query).length === 0) {
      // If no filters provided, return all series with the specified category and fields
      series = await Series.find(
        { category: categoryDoc._id },
        {
          poster: 1,
          title: 1,
          genre: 1,
          year: 1,
          country: 1,
          language: 1,
          imdbRating: 1,
          runtime: 1,
          category: 1,
          imdbID: 1,
          _id: 1,
          released: 1,
        }
      ).sort({ createdAt: -1 });
    } else {
      // If filters provided, return query result with specified fields
      series = await Series.find(query, {
        poster: 1,
        title: 1,
        genre: 1,
        year: 1,
        country: 1,
        language: 1,
        imdbRating: 1,
        runtime: 1,
        category: 1,
        imdbID: 1,
        _id: 1,
      }).sort({ createdAt: -1 });
    }

    res.json(series);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

//Get Series BY ID
const getSerieseById = async (req, res) => {
  const { id } = req.params;
  try {
    const series = await Series.findById(id).populate("category");
    if (!series) {
      return res.status(404).send({ error: "Series not found." });
    }
    res.send(series);
  } catch (error) {
    res.status(400).send({ error: "Error fetching Series." });
  }
};

// Get Series Count By Category
const getSeriesCountByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Find the category by name
    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Count the number of series that match the category
    const count = await Series.countDocuments({ category: categoryDoc._id });

    res.status(200).json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllMovieBanner,
  getAllMoviesByCategory,
  getTrendingMovies,
  getMovieById,
  getMoviesCountByCategory,
  getAllSeriesBanner,
  getSeriesCountByCategory,
  getAllSeriesByCategory,
  getSerieseById,
};
