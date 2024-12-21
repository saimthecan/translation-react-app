import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Grid,
  IconButton,
  Tabs,
  Tab,
  Box,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import ClearIcon from "@mui/icons-material/Clear";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import axios from "axios";
import { baseLanguages, extraLanguages } from "../data/languages";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("Detect Language");
  const [outputLanguageIndex, setOutputLanguageIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [customLanguage, setCustomLanguage] = useState(null);
  const [customLangDialogOpen, setCustomLangDialogOpen] = useState(false);
  const [customLanguageInput, setCustomLanguageInput] = useState("");

  const inputRef = useRef(null);
  const outputRef = useRef(null);

  // Yükseklik senkronizasyonu
  useEffect(() => {
    if (inputRef.current && outputRef.current) {
      inputRef.current.style.height = "auto";
      outputRef.current.style.height = "auto";

      const inputHeight = inputRef.current.scrollHeight;
      const outputHeight = outputRef.current.scrollHeight;
      const maxHeight = Math.max(inputHeight, outputHeight);

      inputRef.current.style.height = `${maxHeight}px`;
      outputRef.current.style.height = `${maxHeight}px`;
    }
  }, [inputText, translatedText]);

  // Çeviri metnini kopyalama
  const handleCopyTranslation = () => {
    navigator.clipboard.writeText(translatedText).then(() => {
      toast.success("Translation copied!", {
        position: "bottom-right",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
      });
    });
  };

  // Görüntülenecek diller listesi (4 temel + custom varsa eklenir)
  const displayedLanguages = [...baseLanguages];
  if (customLanguage) {
    displayedLanguages.push(customLanguage);
  }

  // Şu anki (sekmede seçili) hedef dilin kodu
  const getCurrentTargetLanguageCode = () => {
    const currentLang = displayedLanguages[outputLanguageIndex];
    return currentLang.code;
  };

  // Kullanıcı yazarken
  const handleInputChange = async (event) => {
    const text = event.target.value;
    setInputText(text);

    if (text.trim() !== "") {
      try {
        setTranslatedText("Translating...");
        // 1) Dil algılama
        const languageResponse = await axios.post(
          "https://translation-canozgen-8f135668af13.herokuapp.com//detect-language",
          {
            text_to_detect: text,
          }
        );
        setDetectedLanguage(
          languageResponse.data.detected_language || "Detect Language"
        );

        // 2) Çeviri
        const translateResponse = await axios.post(
          "https://translation-canozgen-8f135668af13.herokuapp.com//translate",
          {
            text_to_translate: text,
            target_language: getCurrentTargetLanguageCode(),
          }
        );
        setTranslatedText(translateResponse.data.translated_text);
      } catch (error) {
        console.error("Translation failed:", error);
        setTranslatedText("Error: Could not translate text.");
        setDetectedLanguage("Detect Language");
      }
    } else {
      setTranslatedText("");
      setDetectedLanguage("Detect Language");
    }
  };

  // Kullanıcı yapıştırdığında
  const handlePaste = async (event) => {
    event.preventDefault();
    const pastedText = await navigator.clipboard.readText();
    setInputText(pastedText);

    if (pastedText.trim() !== "") {
      try {
        setTranslatedText("Translating...");
        // Dil algılama
        const languageResponse = await axios.post(
          "https://translation-canozgen-8f135668af13.herokuapp.com//detect-language",
          {
            text_to_detect: pastedText,
          }
        );
        setDetectedLanguage(
          languageResponse.data.detected_language || "Detect Language"
        );

        // Çeviri
        const translateResponse = await axios.post(
          "https://translation-canozgen-8f135668af13.herokuapp.com//translate",
          {
            text_to_translate: pastedText,
            target_language: getCurrentTargetLanguageCode(),
          }
        );
        setTranslatedText(translateResponse.data.translated_text);
      } catch (error) {
        console.error("Translation failed:", error);
        setTranslatedText("Error: Could not translate text.");
        setDetectedLanguage("Detect Language");
      }
    } else {
      setTranslatedText("");
      setDetectedLanguage("Detect Language");
    }
  };

  // Sekmeden (Tab) dil değiştiğinde
  const handleOutputLanguageChange = async (event, newValue) => {
    setOutputLanguageIndex(newValue);
    if (inputText.trim() !== "") {
      try {
        setTranslatedText("Translating...");
        const response = await axios.post("https://translation-canozgen-8f135668af13.herokuapp.com//translate", {
          text_to_translate: inputText,
          target_language: displayedLanguages[newValue].code,
        });
        setTranslatedText(response.data.translated_text);
      } catch (error) {
        console.error("Translation failed:", error);
        setTranslatedText("Error: Could not translate text.");
      }
    }
  };

  // "More" menüsü aç/kapa
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Ekstra dillerden seçim
  const handleExtraLanguageSelect = async (langCode) => {
    handleCloseMenu();

    // Custom dil sekmesi
    setCustomLanguage({
      name: `Custom (${langCode})`,
      code: langCode,
    });

    // Index'i custom dil sekmesine al
    setTimeout(() => {
      setOutputLanguageIndex(baseLanguages.length);
    }, 0);

    setTranslatedText("Translating...");

    if (inputText.trim() !== "") {
      try {
        const response = await axios.post("https://translation-canozgen-8f135668af13.herokuapp.com//translate", {
          text_to_translate: inputText,
          target_language: langCode,
        });
        setTranslatedText(response.data.translated_text);
      } catch (error) {
        console.error("Translation failed:", error);
        setTranslatedText("Error: Could not translate text.");
      }
    }
  };

  // Custom Language Dialog
  const openCustomLanguageDialog = () => {
    handleCloseMenu();
    setCustomLangDialogOpen(true);
  };

  const handleConfirmCustomLanguage = () => {
    const lang = customLanguageInput.trim();
    if (!lang) {
      return;
    }

    setCustomLangDialogOpen(false);
    setCustomLanguageInput("");

    setCustomLanguage({
      name: `Custom (${lang})`,
      code: lang,
    });

    setTimeout(() => {
      setOutputLanguageIndex(baseLanguages.length);
    }, 0);

    setTranslatedText("Translating...");

    axios
      .post("https://translation-canozgen-8f135668af13.herokuapp.com//translate", {
        text_to_translate: inputText,
        target_language: lang,
      })
      .then((res) => {
        setTranslatedText(res.data.translated_text);
      })
      .catch((err) => {
        console.error("Translation failed:", err);
        setTranslatedText("Error: Could not translate text.");
      });
  };

  // Giriş ve çıkış temizle
  const clearInput = () => {
    setInputText("");
    setTranslatedText("");
    setDetectedLanguage("Detect Language");
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Grid container spacing={2} >
        {/* Birinci sütun: Detected Language Sekmesi + Input */}
        <Grid item xs={12} md={6}>
          {/* Detected Language Sekmesi */}
          <Box sx={{ mb: 1 }}>
            <Tabs
              value={0}
              onChange={() => {}}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="input language tabs"
              TabIndicatorProps={{ sx: { height: "2px" } }}
              sx={{
                minHeight: 24,
                fontSize: "0.7rem",
                ".MuiTab-root": { minHeight: 24, minWidth: 70 },
              }}
            >
              <Tab
                label={detectedLanguage}
                sx={{
                  fontSize: "0.7rem",
                  textTransform: "none",
                  width: "8rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              />
            </Tabs>
          </Box>

          {/* Input TextArea */}
          <Box sx={{ position: "relative" }}>
            <TextareaAutosize
              ref={inputRef}
              minRows={7}
              placeholder="Type or paste your text here..."
              value={inputText}
              onChange={handleInputChange}
              onPaste={handlePaste}
              style={{
                width: "100%",
                backgroundColor: "white",
                borderRadius: "10px",
                padding: "10px",
                paddingRight: "40px",
                border: "1px solid #ccc",
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
                marginTop:"6.2px"
              }}
            />
            {inputText && (
              <IconButton
                onClick={clearInput}
                sx={{
                  position: "absolute",
                  top: "1.2rem",
                  right: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  color: "rgba(0, 0, 0, 0.5)",
                  zIndex: 10,
                  boxShadow: "0 0 4px rgba(0,0,0,0.2)",
                  borderRadius: "50%",
                  padding: "4px",
                  "&:hover": {
                    color: "rgba(0, 0, 0, 0.8)",
                  },
                }}
              >
                <ClearIcon sx={{ fontSize: "1rem" }} />
              </IconButton>
            )}
          </Box>
        </Grid>

        {/* İkinci sütun: Output Language Sekmesi + Output */}
        <Grid item xs={12} md={6}>
          {/* Output Language Sekmesi + More Menüsü aynı satırda */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Tabs
              value={outputLanguageIndex}
              onChange={handleOutputLanguageChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="output language tabs"
              TabIndicatorProps={{ sx: { height: "2px" } }}
              sx={{
                flexGrow: 1, // Mevcut alanı kapla
                minHeight: 24,
                fontSize: "0.7rem",
                ".MuiTab-root": { minHeight: 24, minWidth: 70 },
              }}
            >
              {displayedLanguages.map((lang, i) => (
                <Tab
                  key={lang.code}
                  label={lang.name}
                  sx={{ fontSize: "0.7rem", textTransform: "none" }}
                />
              ))}
            </Tabs>

            <IconButton onClick={handleOpenMenu} sx={{ ml: 1 }}>
              <MoreHorizIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
              {extraLanguages.map((lang) => (
                <MenuItem
                  key={lang.code}
                  onClick={() => handleExtraLanguageSelect(lang.code)}
                  sx={{
                    fontSize: "0.75rem",
                    padding: "8px 16px",
                  }}
                >
                  {lang.name}
                </MenuItem>
              ))}
              <MenuItem
                onClick={openCustomLanguageDialog}
                sx={{
                  fontSize: "0.75rem",
                  padding: "8px 16px",
                }}
              >
                Custom Language...
              </MenuItem>
            </Menu>
          </Box>

          {/* Output TextArea */}
          <Box sx={{ position: "relative" }}>
            <TextareaAutosize
              ref={outputRef}
              minRows={7}
              readOnly
              placeholder="Your translated text will appear here..."
              value={translatedText}
              style={{
                width: "100%",
                backgroundColor: "white",
                borderRadius: "10px",
                padding: "10px",
                paddingRight: "40px",
                border: "1px solid #ccc",
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {translatedText && (
              <IconButton
                onClick={handleCopyTranslation}
                sx={{
                  position: "absolute",
                  top: "1.2rem",
                  right: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  color: "rgba(0, 0, 0, 0.5)",
                  zIndex: 10,
                  boxShadow: "0 0 4px rgba(0,0,0,0.2)",
                  borderRadius: "50%",
                  padding: "4px",
                  "&:hover": {
                    color: "rgba(0, 0, 0, 0.8)",
                  },
                }}
              >
                <ContentCopyIcon sx={{ fontSize: "1rem" }} />
              </IconButton>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Custom Language Dialog */}
      <Dialog
        open={customLangDialogOpen}
        onClose={() => setCustomLangDialogOpen(false)}
        aria-labelledby="custom-lang-dialog-title"
      >
        <DialogTitle id="custom-lang-dialog-title">Custom Language</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Enter your custom language"
            fullWidth
            variant="outlined"
            value={customLanguageInput}
            onChange={(e) => setCustomLanguageInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCustomLangDialogOpen(false);
              setCustomLanguageInput("");
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmCustomLanguage} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toastify Container */}
      <ToastContainer />
    </Container>
  );
};

export default Home;
