import os
import argparse
import sys

def process_file(file_path):
    """
    Reads a file, removes trailing 0xee padding, and replaces
    remaining internal 0xee with 0xff.
    Provides detailed statistics on the operation.
    Compatible with Python 2 and Python 3.
    """
    try:
        # Open file in binary read mode
        with open(file_path, 'rb') as f:
            content = f.read()

        original_size = len(content)
        
        # Define byte patterns
        # Note: In Py2, b'\xee' is a str; in Py3, it is bytes.
        padding_char = b'\xee'
        replacement_char = b'\xff'

        # 1. Remove trailing 0xee bytes (Right Trim)
        # rstrip removes specified bytes from the tail until a different byte is found
        trimmed_content = content.rstrip(padding_char)
        trimmed_size = len(trimmed_content)
        
        # Calculate how many padding bytes were removed
        bytes_removed = original_size - trimmed_size
        
        # 2. Count remaining 0xee bytes in the "middle" of the file
        # These are the ones that survived the trim and need replacement
        replacements_count = trimmed_content.count(padding_char)

        # 3. Perform replacement only if necessary
        if replacements_count > 0:
            final_content = trimmed_content.replace(padding_char, replacement_char)
        else:
            final_content = trimmed_content

        # Check if any modification occurred (either size change or content substitution)
        if bytes_removed > 0 or replacements_count > 0:
            # Write the modified content back to the file
            with open(file_path, 'wb') as f:
                f.write(final_content)
            
            # Output statistics using .format() for Python 2 compatibility
            print("[MODIFIED] {}".format(os.path.basename(file_path)))
            print("    - Padding removed (end of file): {} bytes".format(bytes_removed))
            print("    - Internal replacements (0xee->0xff): {} occurrences".format(replacements_count))
            print("    - Total size: {} -> {} bytes".format(original_size, len(final_content)))
            print("-" * 40) # Visual separator
        else:
            print("[SKIPPED]   {} (No relevant 0xee pattern found)".format(os.path.basename(file_path)))

    except Exception as e:
        print("[ERROR]     Cannot process {}: {}".format(os.path.basename(file_path), e))

def main():
    # Argument parser setup
    parser = argparse.ArgumentParser(description="Clean trailing 0xee padding and replace internal 0xee with 0xff.")
    parser.add_argument("path", help="Path to the directory containing files to process")
    
    args = parser.parse_args()
    target_dir = args.path

    # Validate input path
    if not os.path.exists(target_dir):
        print("Error: The path '{}' does not exist.".format(target_dir))
        return
    if not os.path.isdir(target_dir):
        print("Error: The path '{}' is not a directory.".format(target_dir))
        return

    print("--- Starting processing in directory: {} ---\n".format(target_dir))

    files_found = False
    
    try:
        # Iterate over files in the directory
        # os.listdir returns filenames, not full paths
        for filename in os.listdir(target_dir):
            full_path = os.path.join(target_dir, filename)
            
            # Ensure we process files only (skip subdirectories)
            if os.path.isfile(full_path):
                files_found = True
                process_file(full_path)
    except Exception as e:
        print("Error reading directory: {}".format(e))

    if not files_found:
        print("No files found in the specified directory.")

    print("\n--- Processing completed ---")

if __name__ == "__main__":
    main()
