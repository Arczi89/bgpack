#!/usr/bin/env python3
"""
Prosty test parsera XML dla API BoardGameGeek
"""
import requests
import xml.etree.ElementTree as ET

def test_bgg_api():
    """Test API BoardGameGeek"""
    print("Testowanie API BoardGameGeek...")
    
    # Test 1: Wyszukiwanie gry
    search_url = "https://www.boardgamegeek.com/xmlapi/search?search=Brass&type=boardgame"
    print(f"1. Wyszukiwanie: {search_url}")
    
    try:
        response = requests.get(search_url, timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Content length: {len(response.text)}")
        
        if response.status_code == 200:
            root = ET.fromstring(response.text)
            print(f"Root tag: {root.tag}")
            
            # Znajdź pierwszą grę
            items = root.findall('.//item')
            if items:
                first_item = items[0]
                game_id = first_item.get('id')
                name = first_item.find('name')
                if name is not None:
                    print(f"Pierwsza gra: ID={game_id}, Name={name.text}")
                    
                    # Test 2: Szczegóły gry
                    details_url = f"https://www.boardgamegeek.com/xmlapi/boardgame/{game_id}"
                    print(f"\n2. Szczegóły gry: {details_url}")
                    
                    details_response = requests.get(details_url, timeout=10)
                    print(f"Status: {details_response.status_code}")
                    print(f"Content length: {len(details_response.text)}")
                    
                    if details_response.status_code == 200:
                        details_root = ET.fromstring(details_response.text)
                        game = details_root.find('.//boardgame')
                        
                        if game is not None:
                            print("\n=== SZCZEGÓŁY GRY ===")
                            
                            # Podstawowe informacje
                            name_elem = game.find('name[@primary="true"]')
                            if name_elem is not None:
                                print(f"Nazwa: {name_elem.text}")
                            
                            year = game.find('yearpublished')
                            if year is not None:
                                print(f"Rok: {year.text}")
                            
                            min_players = game.find('minplayers')
                            max_players = game.find('maxplayers')
                            if min_players is not None and max_players is not None:
                                print(f"Gracze: {min_players.text}-{max_players.text}")
                            
                            playing_time = game.find('playingtime')
                            if playing_time is not None:
                                print(f"Czas gry: {playing_time.text} min")
                            
                            # Statystyki
                            stats = game.find('statistics')
                            if stats is not None:
                                ratings = stats.find('ratings')
                                if ratings is not None:
                                    bgg_rating = ratings.find('bayesaverage')
                                    if bgg_rating is not None:
                                        print(f"BGG Rating: {bgg_rating.text}")
                                    
                                    avg_rating = ratings.find('average')
                                    if avg_rating is not None:
                                        print(f"Średnia ocena: {avg_rating.text}")
                                    
                                    complexity = ratings.find('averageweight')
                                    if complexity is not None:
                                        print(f"Trudność: {complexity.text}")
                            
                            # Ankiety o liczbie graczy
                            polls = game.find('polls')
                            if polls is not None:
                                numplayers_poll = polls.find('poll[@name="suggested_numplayers"]')
                                if numplayers_poll is not None:
                                    print("\n=== ANKIETY O LICZBIE GRACZY ===")
                                    results = numplayers_poll.findall('results')
                                    for result in results:
                                        num_players = result.get('numplayers')
                                        if num_players:
                                            print(f"\nLiczba graczy: {num_players}")
                                            
                                            # Sprawdź rekomendacje
                                            best = result.find('result[@value="Best"]')
                                            recommended = result.find('result[@value="Recommended"]')
                                            not_recommended = result.find('result[@value="Not Recommended"]')
                                            
                                            if best is not None:
                                                print(f"  Best: {best.get('numvotes', '0')} głosów")
                                            if recommended is not None:
                                                print(f"  Recommended: {recommended.get('numvotes', '0')} głosów")
                                            if not_recommended is not None:
                                                print(f"  Not Recommended: {not_recommended.get('numvotes', '0')} głosów")
                    else:
                        print(f"Błąd pobierania szczegółów: {details_response.status_code}")
                else:
                    print("Nie znaleziono nazwy gry")
            else:
                print("Nie znaleziono gier")
        else:
            print(f"Błąd wyszukiwania: {response.status_code}")
            
    except Exception as e:
        print(f"Błąd: {e}")

if __name__ == "__main__":
    test_bgg_api()
