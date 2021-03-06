# frozen_string_literal: true

class FetchRemoteStatusService < BaseService
  include AuthorExtractor

  def call(url, prefetched_body = nil)
    if prefetched_body.nil?
      atom_url, body = FetchAtomService.new.call(url)
    else
      atom_url = url
      body     = prefetched_body
    end

    return nil if atom_url.nil?
    process_atom(atom_url, body)
  end

  private

  def process_atom(url, body)
    Rails.logger.debug "Processing Atom for remote status at #{url}"

    xml = Nokogiri::XML(body)
    xml.encoding = 'utf-8'

    account = author_from_xml(xml.at_xpath('/xmlns:entry', xmlns: TagManager::XMLNS))
    domain  = Addressable::URI.parse(url).normalize.host

    return nil unless !account.nil? && confirmed_domain?(domain, account)

    statuses = ProcessFeedService.new.call(body, account)
    statuses.first
  rescue Nokogiri::XML::XPath::SyntaxError
    Rails.logger.debug 'Invalid XML or missing namespace'
    nil
  rescue Goldfinger::NotFoundError, Goldfinger::Error
    Rails.logger.debug 'Exceptions related to Goldfinger occurs'
    nil
  end

  def confirmed_domain?(domain, account)
    account.domain.nil? || domain.casecmp(account.domain).zero? || domain.casecmp(Addressable::URI.parse(account.remote_url).normalize.host).zero?
  end
end
